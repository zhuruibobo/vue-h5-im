import request from './request.js'

const getSessionlist = params => request({
  url: '/app/getSessionList',
  params,
  method: 'GET'
})

const getMsgRecord = data => request({
  url: '/app/getMsgRecordList',
  data
})

const sendText = params => request({
  url: '/app/text/send',
  params
})

const getMsgMedia = params => request({
  url: '/app/getMsgMedia',
  params,
  method: 'GET'
})

const sendImg = (params, data) => request({
  url: '/app/image/send',
  params,
  data
})

const snedVoice = (params, data) => request({
  url: '/app/voice/send',
  params,
  data
})

export default {
  getSessionlist,
  getMsgRecord,
  sendText,
  getMsgMedia,
  sendImg,
  snedVoice
}
