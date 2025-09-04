/**
 * 文档模块 - 管理文档状态和数据流
 */
import { getDocuments, createDocument, updateDocument, deleteDocument } from '@/api/documents'

const state = {
  // 文档列表
  documents: [],
  documentsLoading: false,
  documentsError: null,
  
  // 当前文档
  currentDocument: null,
  currentDocumentLoading: false,
  currentDocumentError: null,
  
  // 搜索状态
  searchResults: [],
  searchLoading: false,
  searchKeyword: '',
  
  // UI状态
  selectedDocumentId: null,
  isEditorReady: false,
  
  // 保存状态
  saveStatus: 'saved', // 'saving', 'saved', 'error', 'unsaved'
  lastSavedAt: null,
  autoSaveEnabled: true
}

const mutations = {
  // 文档列表
  SET_DOCUMENTS(state, documents) {
    state.documents = documents
  },
  
  ADD_DOCUMENT(state, document) {
    state.documents.unshift(document)
  },
  
  UPDATE_DOCUMENT_IN_LIST(state, updatedDocument) {
    const index = state.documents.findIndex(doc => doc.id === updatedDocument.id)
    if (index !== -1) {
      state.documents.splice(index, 1, updatedDocument)
    }
  },
  
  REMOVE_DOCUMENT(state, documentId) {
    state.documents = state.documents.filter(doc => doc.id !== documentId)
  },
  
  SET_DOCUMENTS_LOADING(state, loading) {
    state.documentsLoading = loading
  },
  
  SET_DOCUMENTS_ERROR(state, error) {
    state.documentsError = error
  },
  
  // 当前文档
  SET_CURRENT_DOCUMENT(state, document) {
    state.currentDocument = document
    if (document) {
      state.selectedDocumentId = document.id
    }
  },
  
  SET_CURRENT_DOCUMENT_LOADING(state, loading) {
    state.currentDocumentLoading = loading
  },
  
  SET_CURRENT_DOCUMENT_ERROR(state, error) {
    state.currentDocumentError = error
  },
  
  UPDATE_CURRENT_DOCUMENT_CONTENT(state, content) {
    if (state.currentDocument) {
      state.currentDocument.content = content
      state.currentDocument.updatedAt = new Date().toISOString()
    }
  },
  
  UPDATE_CURRENT_DOCUMENT_TITLE(state, title) {
    if (state.currentDocument) {
      state.currentDocument.title = title
      state.currentDocument.updatedAt = new Date().toISOString()
    }
  },
  
  // 搜索
  SET_SEARCH_RESULTS(state, results) {
    state.searchResults = results
  },
  
  SET_SEARCH_LOADING(state, loading) {
    state.searchLoading = loading
  },
  
  SET_SEARCH_KEYWORD(state, keyword) {
    state.searchKeyword = keyword
  },
  
  // UI状态
  SET_SELECTED_DOCUMENT_ID(state, documentId) {
    state.selectedDocumentId = documentId
  },
  
  SET_EDITOR_READY(state, ready) {
    state.isEditorReady = ready
  },
  
  // 保存状态
  SET_SAVE_STATUS(state, status) {
    state.saveStatus = status
  },
  
  SET_LAST_SAVED_AT(state, timestamp) {
    state.lastSavedAt = timestamp
  },
  
  SET_AUTO_SAVE_ENABLED(state, enabled) {
    state.autoSaveEnabled = enabled
  }
}

const actions = {
  // 加载文档列表
  async fetchDocuments({ commit, rootGetters }) {
    try {
      commit('SET_DOCUMENTS_LOADING', true)
      commit('SET_DOCUMENTS_ERROR', null)
      
      const userId = rootGetters['auth/userId']
      if (!userId) {
        throw new Error('用户未登录')
      }
      
      const response = await getDocuments()
      const documents = response?.data || response?.items || []
      
      commit('SET_DOCUMENTS', documents)
      
      return documents
    } catch (error) {
      commit('SET_DOCUMENTS_ERROR', error.message || '加载文档失败')
      throw error
    } finally {
      commit('SET_DOCUMENTS_LOADING', false)
    }
  },
  
  // 创建文档
  async createDocument({ commit, dispatch }, { title, content }) {
    try {
      const newDocument = await createDocument({ title, content })
      commit('ADD_DOCUMENT', newDocument)
      
      // 设置为当前文档
      commit('SET_CURRENT_DOCUMENT', newDocument)
      
      return newDocument
    } catch (error) {
      console.error('创建文档失败:', error)
      throw error
    }
  },
  
  // 更新文档
  async updateDocument({ commit, state }, { documentId, updates }) {
    try {
      commit('SET_SAVE_STATUS', 'saving')
      
      const updatedDocument = await updateDocument(documentId, updates)
      
      // 更新列表中的文档
      commit('UPDATE_DOCUMENT_IN_LIST', updatedDocument)
      
      // 如果是当前文档，也更新当前文档
      if (state.currentDocument && state.currentDocument.id === documentId) {
        commit('SET_CURRENT_DOCUMENT', updatedDocument)
      }
      
      commit('SET_SAVE_STATUS', 'saved')
      commit('SET_LAST_SAVED_AT', new Date().toISOString())
      
      return updatedDocument
    } catch (error) {
      commit('SET_SAVE_STATUS', 'error')
      console.error('更新文档失败:', error)
      throw error
    }
  },
  
  // 删除文档
  async deleteDocument({ commit }, documentId) {
    try {
      await deleteDocument(documentId)
      commit('REMOVE_DOCUMENT', documentId)
      
      // 如果删除的是当前文档，清除当前文档
      if (state.currentDocument && state.currentDocument.id === documentId) {
        commit('SET_CURRENT_DOCUMENT', null)
      }
      
      return true
    } catch (error) {
      console.error('删除文档失败:', error)
      throw error
    }
  },
  
  // 选择文档
  selectDocument({ commit, state }, document) {
    commit('SET_CURRENT_DOCUMENT', document)
    commit('SET_SAVE_STATUS', 'saved')
  },
  
  // 更新文档内容（本地）
  updateDocumentContent({ commit, state }, content) {
    commit('UPDATE_CURRENT_DOCUMENT_CONTENT', content)
    
    // 标记为未保存
    if (state.saveStatus !== 'saving') {
      commit('SET_SAVE_STATUS', 'unsaved')
    }
  },
  
  // 更新文档标题（本地）
  updateDocumentTitle({ commit, state }, title) {
    commit('UPDATE_CURRENT_DOCUMENT_TITLE', title)
    
    // 标记为未保存
    if (state.saveStatus !== 'saving') {
      commit('SET_SAVE_STATUS', 'unsaved')
    }
  },
  
  // 自动保存当前文档
  async autoSaveCurrentDocument({ commit, state, dispatch }) {
    if (!state.currentDocument || !state.autoSaveEnabled || state.saveStatus === 'saving') {
      return
    }
    
    if (state.saveStatus === 'unsaved') {
      try {
        await dispatch('updateDocument', {
          documentId: state.currentDocument.id,
          updates: {
            title: state.currentDocument.title,
            content: state.currentDocument.content
          }
        })
      } catch (error) {
        console.error('自动保存失败:', error)
      }
    }
  },
  
  // 搜索文档
  async searchDocuments({ commit }, keyword) {
    try {
      commit('SET_SEARCH_LOADING', true)
      commit('SET_SEARCH_KEYWORD', keyword)
      
      // 这里应该调用搜索API
      // const results = await searchDocumentsAPI(keyword)
      
      // 模拟搜索结果
      const results = []
      commit('SET_SEARCH_RESULTS', results)
      
      return results
    } catch (error) {
      console.error('搜索失败:', error)
      commit('SET_SEARCH_RESULTS', [])
      throw error
    } finally {
      commit('SET_SEARCH_LOADING', false)
    }
  },
  
  // 清理状态
  clearDocuments({ commit }) {
    commit('SET_DOCUMENTS', [])
    commit('SET_CURRENT_DOCUMENT', null)
    commit('SET_SEARCH_RESULTS', [])
    commit('SET_SEARCH_KEYWORD', '')
    commit('SET_SAVE_STATUS', 'saved')
  }
}

const getters = {
  // 文档列表
  documents: state => state.documents,
  documentsLoading: state => state.documentsLoading,
  documentsError: state => state.documentsError,
  documentCount: state => state.documents.length,
  
  // 当前文档
  currentDocument: state => state.currentDocument,
  currentDocumentLoading: state => state.currentDocumentLoading,
  currentDocumentError: state => state.currentDocumentError,
  currentDocumentId: state => state.currentDocument?.id || null,
  currentDocumentTitle: state => state.currentDocument?.title || '',
  currentDocumentContent: state => state.currentDocument?.content || '',
  
  // 搜索
  searchResults: state => state.searchResults,
  searchLoading: state => state.searchLoading,
  searchKeyword: state => state.searchKeyword,
  hasSearchResults: state => state.searchResults.length > 0,
  
  // UI状态
  selectedDocumentId: state => state.selectedDocumentId,
  isEditorReady: state => state.isEditorReady,
  
  // 保存状态
  saveStatus: state => state.saveStatus,
  lastSavedAt: state => state.lastSavedAt,
  autoSaveEnabled: state => state.autoSaveEnabled,
  isUnsaved: state => state.saveStatus === 'unsaved',
  isSaving: state => state.saveStatus === 'saving',
  
  // 按ID查找文档
  getDocumentById: state => id => {
    return state.documents.find(doc => doc.id === id)
  },
  
  // 最近文档
  recentDocuments: state => {
    return state.documents
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}