<template>
  <div class="chat">
    <van-pull-refresh v-model="isLoading" :success-text="successText" @refresh="getPrev">
      <template #pulling>
        <span>加载历史记录</span>
      </template>
      <template #loosing>
        <span>释放加载历史记录</span>
      </template>
      <div class="chat-record">
        <div class="chat-item" v-for="(item, index) in recordList" :key="index">
          <div v-if="item.showTime" class="create-time"><span>{{new Date(item.createTime).toLocaleString()}}</span></div>
          <div :class="[item.isMe?'right':'left']">
            <img :src="item.isMe ? headImg : headImg " alt="" class="user-head">
            <!-- <tringle></tringle> -->
            <canvas width="20" height="30" :class="['canvas', 'canvas' + index]" style="transform: translate(-2px, 10px);"></canvas>
            <!-- <div style="border: 8px solid transparent; borderLeft: 10px solid #9EEA6A; transform: translateY(10px);"></div> -->
            <span class="content" v-if="item.msgtype === 'text'" v-html="item.html"></span>
            <img class="image" :src="item.url" alt="" v-if="item.msgtype === 'image'" referrerPolicy="no-referrer" @click="viewImg(item.url)">
            <div class="voice-wrap" v-if="item.msgtype === 'voice' && !item.isMe" @click="playAmr(item, index)">
              <img v-show="!item.isListening" src="../assets/voice-left.png" alt="">
              <img v-show="item.isListening" src="../assets/speakingLeft.gif" alt="">
              <span>{{item.voiceTime}}''</span>
            </div>
            <div class="voice-wrap" v-if="item.msgtype === 'voice' && item.isMe" @click="playAmr(item, index)">
              <span>{{item.voiceTime}}''</span>
              <img v-show="!item.isListening" src="../assets/voice-right.png" alt="">
              <img v-show="item.isListening" src="../assets/speakingRight.gif" alt="">
            </div>
          </div>
        </div>
        <div v-if="accessUserId !== 0" class="access-wrap">
          <span class="tip">{{accessUserName}}已接入,他人无法接收到消息通知</span>
          <span class="btn" v-if="accessUserId == clientUserId" @click="release">释放</span>
        </div>
        <!-- <div class="remark" @click="showRemark = true">备注</div> -->
      </div>
    </van-pull-refresh>
    <div class="bottom-wrap">
      <div class="line">
        <div class="voice-wrap">
          <img v-show="recordIcon" class="voice" src="../assets/voice.png" alt="说话" @click="showRecordButton">
          <img v-show="!recordIcon" class="voice" src="../assets/keyboard.png" alt="输入" @click="showInput">
        </div>
        <el-input v-show="recordIcon" type="textarea" :autosize="{ minRows: 1, maxRows: 3}" resize="none" v-model="message"
          @focus="textFocus"
          @blur="textBlur"
          @click.native="textClick"
          @input="textInput"
          :readonly="readonly"></el-input>
        <div v-show="!recordIcon" class="use-voice record-btn">按住 说话</div>
        <img @click="showKeyBoard" v-show="emojiIcon" class="emoji" src="../assets/emoji.png" alt="">
        <img @click="showEmoji" v-show="keyBoardIcon" class="emoji" src="../assets/keyboard.png" alt="输入">
        <div class="right-icon-wrap">
          <img @click="showAdd" v-show="addIcon" class="more" src="../assets/more.png" alt="" >
          <div v-show="!addIcon" class="btn" @click="send">发送</div>
        </div>
      </div>
      <div v-show="tool" class="tool">
        <!-- <div class="image-wrap">
          <div class="image">
            <img src="../assets/photos.png" alt="相册">
          </div>
          <span>相册</span>
        </div>
        <div class="image-wrap">
          <div class="image">
            <img src="../assets/cat.png" alt="拍摄">
          </div>
          <span>拍摄</span>
        </div> -->
        <van-uploader class="image-wrap" :after-read="afterRead">
          <div class="image">
            <img src="../assets/photos.png" alt="相册">
          </div>
          <span>相册</span>
        </van-uploader>
      </div>
      <div v-show="show" class="qqface-container">
        <span class="qqface-wrapper" v-for="(item, idx) in testList" :key="idx">
          <img :src="publicPath + '/qqface.png'" class="qqface" :class="[`qqface${idx}`]" @click="addEmoji(idx)">
        </span>
      </div>
    </div>
    <div class="voicing" v-if="isRecording">
      <div class="shadow">
        <div class="gif-wrap">
          <img src="../assets/voicing.gif" alt="正在讲话">
        </div>
        <div class="tip">松开 发送，上滑 取消</div>
        <div class="voice-btn">
          <img src="../assets/voice-left.png" alt="">
        </div>
      </div>
    </div>
    <div class="loading" :style="{left: sendMessage ? 0 : '100vw'}">
      <van-loading size="24px" vertical color="#fff">发送图片中...</van-loading>
    </div>
    <van-image-preview v-model="viewImage" :images="imgList">
    </van-image-preview>
    <div class="remark" :style="{bottom: (tool || show) ? '270px' : '70px'}" @click="showRemark = true">备注</div>
    <!--<van-button class="remark" text="备注" @click="showRemark = true" />-->
    <van-overlay :show="showRemark">
      <div class="wrapper">
        <div class="remark-wrap">
          <van-cell-group>
            <van-field v-model="remarkForm.remarkName" label="用户姓名" placeholder="请输入用户名称" />
          </van-cell-group>
          <van-cell-group>
            <van-field v-model="remarkForm.remarkPhone" type="tel" label="用户电话" placeholder="请输入用户电话" />
          </van-cell-group>
          <van-field name="degree" label="紧急程度">
            <template #input>
              <van-radio-group v-model="remarkForm.remarkDegree">
                <van-radio :name="4">特急</van-radio>
                <van-radio :name="3">紧急</van-radio>
                <van-radio :name="2">一般</van-radio>
                <van-radio :name="1">无</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <div class="btn-wrap">
            <div class="cancel" @click="showRemark = false">取消</div>
            <div class="submit" @click="remark">提交</div>
          </div>
        </div>
      </div>
    </van-overlay>
  </div>
</template>

<script>
import BenzAMRRecorder from 'benz-amr-recorder'
import { Notify } from 'vant'

export default {
  name: 'Chat',
  data() {
    return {
      publicPath: process.env.BASE_URL,
      isRecording: false,
      recordIcon: true,
      viewImage: false,
      testList: new Array(109),
      sendMessage: false,
      tool: false,
      isLoading: false,
      keyBoardIcon: false,
      emojiIcon: true,
      show: false, // 是否显示emoji表情选择框
      addIcon: true,
      cancelKeyBoard: false,
      readonly: false,
      sendLoading: false,
      showTool: false,
      showRemark: false,
      qqFaceMap: {
        "/::)": '0',
        "/::~": 1,
        "/::B": 2,
        "/::|": 3,
        "/:8-)": 4,
        "/::<": 5,
        "/::$": 6,
        "/::X": 7,
        "/::Z": 8,
        "/::'(": 9,
        "/::-|": 10,
        "/::@": 11,
        "/::P": 12,
        "/::D": 13,
        "/::O": 14,
        "/::(": 15,
        "/:--b": 16,
        "/::Q": 17,
        "/::T": 18,
        "/:,@P": 19,
        "/:,@-D": 20,
        "/::d": 21,
        "/:,@o": 22,
        "/:|-)": 23,
        "/::!": 24,
        "/::>": 25,
        "/::,@": 26,
        "/::-S": 27,
        "/:?": 28,
        "/:,@x": 29,
        "/:,@@": 30,
        "/:,@!": 31,
        "/:!!!": 32,
        "/:xx": 33,
        "/:bye": 34,
        "/:wipe": 35,
        "/:dig": 36,
        "/:handclap": 37,
        "/:B-)": 38,
        "/:@>": 39,
        "/:>-|": 40,
        "/:P-(": 41,
        "/::'|": 42,
        "/:X-)": 43,
        "/::*": 44,
        "/:8*": 45,
        "[Happy]": 46,
        "[Sick]": 47,
        "[Flushed]": 48,
        "[Lol]": 49,
        "[Terror]": 50,
        "[LetDown]": 51,
        "[Duh]": 52,
        "[Hey]": 53,
        "[Facepalm]": 54,
        "[Smirk]": 55,
        "[Smart]": 56,
        "[Concerned]": 57,
        "[Yeah!]": 58,
        "[Onlooker]": 59,
        "[GoForIt]": 60,
        "[Sweats]": 61,
        "[OMG]": 62,
        "[Emm]": 63,
        "[Respect]": 64,
        "[Doge]": 65,
        "[NoProb]": 66,
        "[MyBad]": 67,
        "[Wow]": 68,
        "[Boring]": 69,
        "[Awesome]": 70,
        "[LetMeSee]": 71,
        "[Sigh]": 72,
        "[Hurt]": 73,
        "[Broken]": 74,
        "/:showlove": 75,
        "/:heart": 76,
        "/:break": 77,
        "/:hug": 78,
        "/:strong": 79,
        "/:weak": 80,
        "/:share": 81,
        "/:v": 82,
        "/:@)": 83,
        "/:jj": 84,
        "/:@@": 85,
        "/:ok": 86,
        "[Worship]": 87,
        "/:beer": 88,
        "/:coffee": 89,
        "/:cake": 90,
        "/:rose": 91,
        "/:fade": 92,
        "/:pd": 93,
        "/:bome": 94,
        "/:shit": 95,
        "/:moon": 96,
        "/:sun": 97,
        "[Party]": 98,
        "/:gift": 99,
        "[Packet]": 100,
        "[Rich]": 101,
        "[Blessing]": 102,
        "[Fireworks]": 103,
        "[爆竹]": 104,
        "/:pig": 105,
        "/:jump": 106,
        "/:shake": 107,
        "/:circle": 108
      },
      reverseMap: {
        0: "/::)",
        1: "/::~",
        2: "/::B",
        3: "/::|",
        4: "/:8-)",
        5: "/::<",
        6: "/::$",
        7: "/::X",
        8: "/::Z",
        9: "/::'(",
        10: "/::-|",
        11: "/::@",
        12: "/::P",
        13: "/::D",
        14: "/::O",
        15: "/::(",
        16: "/:--b",
        17: "/::Q",
        18: "/::T",
        19: "/:,@P",
        20: "/:,@-D",
        21: "/::d",
        22: "/:,@o",
        23: "/:|-)",
        24: "/::!",
        25: "/::>",
        26: "/::,@",
        27: "/::-S",
        28: "/:?",
        29: "/:,@x",
        30: "/:,@@",
        31: "/:,@!",
        32: "/:!!!",
        33: "/:xx",
        34: "/:bye",
        35: "/:wipe",
        36: "/:dig",
        37: "/:handclap",
        38: "/:B-)",
        39: "/:@>",
        40: "/:>-|",
        41: "/:P-(",
        42: "/::'|",
        43: "/:X-)",
        44: "/::*",
        45: "/:8*",
        46: "[Happy]",
        47: "[Sick]",
        48: "[Flushed]",
        49: "[Lol]",
        50: "[Terror]",
        51: "[LetDown]",
        52: "[Duh]",
        53: "[Hey]",
        54: "[Facepalm]",
        55: "[Smirk]",
        56: "[Smart]",
        57: "[Concerned]",
        58: "[Yeah!]",
        59: "[Onlooker]",
        60: "[GoForIt]",
        61: "[Sweats]",
        62: "[OMG]",
        63: "[Emm]",
        64: "[Respect]",
        65: "[Doge]",
        66: "[NoProb]",
        67: "[MyBad]",
        68: "[Wow]",
        69: "[Boring]",
        70: "[Awesome]",
        71: "[LetMeSee]",
        72: "[Sigh]",
        73: "[Hurt]",
        74: "[Broken]",
        75: "/:showlove",
        76: "/:heart",
        77: "/:break",
        78: "/:hug",
        79: "/:strong",
        80: "/:weak",
        81: "/:share",
        82: "/:v",
        83: "/:@)",
        84: "/:jj",
        85: "/:@@",
        86: "/:ok",
        87: "[Worship]",
        88: "/:beer",
        89: "/:coffee",
        90: "/:cake",
        91: "/:rose",
        92: "/:fade",
        93: "/:pd",
        94: "/:bome",
        95: "/:shit",
        96: "/:moon",
        97: "/:sun",
        98: "[Party]",
        99: "/:gift",
        100: "[Packet]",
        101: "[Rich]",
        102: "[Blessing]",
        103: "[Fireworks]",
        104: "[爆竹]",
        105: "/:pig",
        106: "/:jump",
        107: "/:shake",
        108: "/:circle"
      },
      message: '',
      clientImg: localStorage.getItem('headImg'),
      // headImg: this.$route.query.headImg,
      headImg: require('@/assets/headImg.jpg'),
      prevForm: {
        appId: this.$route.query.appId,
        openId: this.$route.query.openId,
        // start: Number(this.$route.query.start) - 2 * 60 * 60 * 1000,
        page: 0,
        end: Number(this.$route.query.start)
      },
      nextForm: {
        appId: this.$route.query.appId,
        openId: this.$route.query.openId,
        start: Number(this.$route.query.start) + 1,
        end: new Date().getTime()
      },
      successText: '加载成功',
      sessionCreateTime: Number(this.$route.query.createTime),
      // eslint-disable-next-line global-require
      userHead: require('@/assets/headImg.jpg'),
      userName: this.$route.query.userName,
      recordList: [],
      sessionInfo: JSON.parse(localStorage.getItem('sessionInfo')),
      interVal: null,
      amr: new BenzAMRRecorder(),
      amrRecord: new BenzAMRRecorder(),
      imgList: [],
      clientY: 0,
      clientUserId: Number(localStorage.getItem('userId')),
      accessUserId: Number(this.$route.query.accessUserId),
      accessUserName: this.$route.query.accessUserName,
      remarkForm: {
        remarkDegree: Number(this.$route.query.remarkDegree),
        remarkName: this.$route.query.remarkName,
        remarkPhone: this.$route.query.remarkPhone,
        sessionRecordId: Number(this.$route.query.sessionRecordId)
      },
      listen: null,
      listenIndex: null
    }
  },
  methods: {
    release() {
      this.$dialog.confirm({
        // title: '提示',
        message: '释放会话后其他客服将接收消息通知，确定释放吗？',
      }).then(() => {
        chatApi.release({
          sessionRecordId: this.$route.query.sessionRecordId
        }).then(() => {
          let query = JSON.parse(JSON.stringify(this.$route.query))
          query.accessUserId = 0
          query.accessUserName = localStorage.getItem('name')
          this.accessUserId = 0
          this.$router.replace({
            query
          })
        })
      }).catch(() => {})
    },
    remark() {
      chatApi.remark(this.remarkForm).then(() => {
        this.showRemark = false
      })
    },
    viewImg(url) {
      this.imgList = [url]
      this.viewImage = true
    },
    afterRead(file) {
      const time = new Date().getTime()
      this.sendMessage = true
        let msg = {
          msgtype: 'image',
          content: '',
          createTime: time,
          headImg: this.clientImg,
          url: file.content,
          isMe: true
        }
        this.recordList.push(msg)
        // this.addIcon = false
        this.resetBool()
        this.sendMessage = false
        this.scrollToBottom()
    },
    playAmr(row, index) {
      this.amr.stop()
      this.amr = new BenzAMRRecorder()
      this.amr.initWithUrl(row.url).then(() => {
        this.amr.play()
      })
      if (typeof this.listenIndex == 'number') {
        this.recordList[this.listenIndex].isListening = false
        clearTimeout(this.listen)
        this.listenIndex = index
        this.recordList[index].isListening = true
        this.listen = setTimeout(() => {
          this.recordList[index].isListening = false
        }, row.voiceTime * 1000)
      } else {
        this.listenIndex = index
        this.recordList[index].isListening = true
        this.listen = setTimeout(() => {
          this.recordList[index].isListening = false
        }, row.voiceTime * 1000)
      }
    },
    mouseDown(e) {
      e.preventDefault()
      Notify.clear()
      this.amrRecord = new BenzAMRRecorder()
      this.amrRecord.initWithRecord().then(() => {
        this.amrRecord.startRecord()
        this.isRecording = true
        this.clientY = e.touches[0].clientY
        window.addEventListener('touchmove', this.mouseMove)
      })
    },
    mouseEnd() {
      window.removeEventListener('touchmove', this.mouseMove)
      this.amrRecord.finishRecord().then(() => {
        this.isRecording = false
        // this.amr.stop()
        // this.amr = new BenzAMRRecorder()
        console.log(this.amrRecord.getDuration())
        let file = this.amrRecord.getBlob()
        let voiceTime = this.amrRecord.getDuration()
        if (voiceTime < 1) {
          Notify({ type: 'warning', message: '语音时间不可小于1秒' })
        } else {
          this.sendVoice(file, Math.ceil(voiceTime))
        }
        // this.amr.initWithBlob(file).then(() => {
        //   this.amr.play()
        // })
      })
    },
    mouseMove(e) {
      if ((this.clientY - e.targetTouches[0].clientY) > 100) {
        this.amrRecord.cancelRecord()
        this.isRecording = false
        window.removeEventListener('touchmove', this.mouseMove)
      }
    },
    sendVoice(file, voiceTime) {
      clearInterval(this.interVal)
      const time = new Date().getTime()
        let msg = {
          msgtype: 'voice',
          content: '',
          createTime: time,
          headImg: this.clientImg,
          url: window.URL.createObjectURL(file),
          voiceTime,
          isMe: true
        }
        this.recordList.push(msg)
        // this.addIcon = false
        // this.resetBool()
        // this.sendMessage = false
        this.scrollToBottom()
    },
    showRecordButton() {
      this.tool = false
      this.keyBoardIcon = false
      this.emojiIcon = true
      this.recordIcon = false
      this.show = false
      let recordBtn = document.querySelector('.record-btn')
      window.addEventListener('touchend', this.mouseEnd)
      recordBtn.addEventListener('touchstart', this.mouseDown)
    },
    send() {
      if (this.message && !this.sendLoading) {
        const time = new Date().getTime()
        this.sendLoading = true
          let msg = {
            msgtype: 'text',
            content: this.message,
            createTime: time,
            headImg: this.clientImg,
            html: this.genString2emoji(this.message),
            isMe: true
          }
          this.recordList.push(msg)
          this.message = ''
          // this.addIcon = false
          this.resetBool()
          this.scrollToBottom()
          this.sendLoading = false
          this.$nextTick(() => {
            let canvas = document.querySelector('.canvas' + (this.recordList.length - 1))
            let ctx = canvas.getContext('2d')
            ctx.beginPath()
            ctx.strokeStyle = '#9EEA6A'
            ctx.fillStyle = '#9EEA6A'
            ctx.moveTo(0, 30)
            // ctx.lineTo(20, 40)
            ctx.quadraticCurveTo(20, 20, 20, 0)
            ctx.quadraticCurveTo(15, 10, 0, 10)
            ctx.fill()
          })
      }
    },
    resetBool() {
      this.readonly = false
      this.cancelKeyBoard = false
      this.addIcon = true
      this.show = false
      this.emojiIcon = true
      this.keyBoardIcon = false
      this.isLoading = false
    },
    showAdd() {
      this.recordIcon = true
      this.tool = true
      this.scrollToBottom()
      this.resetBool()
    },
    showEmoji() {
      this.show = false
      this.emojiIcon = true
      this.tool = false
      this.keyBoardIcon = false
      document.querySelector('.el-textarea__inner').blur()
      document.querySelector('.el-textarea__inner').focus()
      // document.querySelector('.van-field__control').blur()
      // document.querySelector('.van-field__control').focus()
    },
    showKeyBoard() {
      this.recordIcon = true
      this.cancelKeyBoard = true
      this.show = true
      this.emojiIcon = false
      this.tool = false
      this.keyBoardIcon = true
      this.readonly = true
      this.scrollToBottom()
      // document.querySelector('.van-field__control').focus()
      document.querySelector('.el-textarea__inner').focus()
    },
    addEmoji(idx) {
      this.message = this.message.slice(0, this.selectionStart) + this.reverseMap[idx] + this.message.slice(this.selectionStart)
      this.cancelKeyBoard = true
      this.readonly = true
      this.selectionStart += this.reverseMap[idx].length
      this.addIcon = false
      // document.querySelector('.van-field__control').focus()
      document.querySelector('.el-textarea__inner').focus()
    },
    showInput() {
      this.recordIcon = true
      this.show = false
      setTimeout(() => {
        document.querySelector('.el-textarea__inner').focus()
      }, 200)
    },
    genString2emoji(words) {
      const keys1 = words.match(/\[(.+?)\]/g) || []
      const keys2 = words.match(/\/\:[^\u4e00-\u9fa5^\/^0^1^2^3^4^5^6^7^9^\s]*/g) || []
      let result = words
      console.log(words, keys1, keys2)
      let that = this
      for (const key1 of keys1) {
        if (this.qqFaceMap[key1]) {
          result = result.replace(key1, `<span style="display: inline-block;" class="qqface-wrapper"><img src="${this.publicPath}/qqface.png" class="qqface qqface${that.qqFaceMap[key1]}"></span>`)
        }
      }
      for (const key2 of keys2) {
        if (this.qqFaceMap[key2]) {
          result = result.replace(key2, `<span style="display: inline-block;" class="qqface-wrapper"><img src="${this.publicPath}/qqface.png" class="qqface qqface${that.qqFaceMap[key2]}"></span>`)
        }
      }
      return result
    },
    getPrev() {
      // this.isLoading = false;
      // if (this.prevForm.start <= this.sessionCreateTime) { // 已查出会话第一条信息
      //   this.successText = '已加载全部历史聊天记录'
      //   this.isLoading = false
      //   return
      // }
      // if (bool) {
      //   this.prevForm.start -= 2 * 60 * 60 * 1000
      //   this.search('prev')
      // } else {
      //   this.prevForm.end = this.recordList[0].createTime - 1
      //   this.prevForm.start = (this.prevForm.end - 2 * 60 * 60 * 1000) < this.sessionCreateTime ? this.sessionCreateTime : (this.prevForm.end - 2 * 60 * 60 * 1000)
      //   this.search('prev')
      // }
      if (!this.histroy) {
        this.prevForm.page += 1
        this.searchPrev('prev')
      } else {
        this.isLoading = false
      }
    },
    getNext() {
      this.nextForm.start = this.recordList[this.recordList.length - 1].createTime + 1
      this.nextForm.end = new Date().getTime()
      this.search('next')
    },
    scrollToBottom(delay = 200) {
      setTimeout(() => {
        let van = document.querySelector('.van-pull-refresh')
        // let vanHiehgt = van.offsetHeight || van.clientHeight
        let recordHeight = document.querySelector('.chat-record').scrollHeight || document.querySelector('.chat-record').offsetHeight
        van.scrollTop = recordHeight
      }, delay)
    },
    textInput(val) {
      console.log(val)
      let strTrim = val.trim()
      if (strTrim.length > 0) {
        this.addIcon = false
      } else {
        this.addIcon = true
      }
      // this.selectionStart = document.querySelector('.el-textarea__inner').selectionStart
    },
    textClick(e) {
      if (!this.cancelKeyBoard) {
        this.show = false
        this.emojiIcon = true
        this.keyBoardIcon = false
        this.tool = false
      }
      e.srcElement.selectionStart = this.selectionStart
      e.srcElement.selectionEnd = this.selectionStart
      this.scrollToBottom()
    },
    textBlur(e) {
      console.log(e)
      if (!this.cancelKeyBoard) {
        this.selectionStart = e.srcElement.selectionStart
      }
    },
    textFocus(e) {
      console.log(e)
      if (!this.cancelKeyBoard) {
        this.show = false
        this.emojiIcon = true
        this.keyBoardIcon = false
        this.tool = false
      } else {
        setTimeout(() => {
          this.readonly = false
          e.srcElement.selectionStart = this.selectionStart
          e.srcElement.selectionEnd = this.selectionStart
        }, 200)
      }
      this.cancelKeyBoard = false
    }
  },
  mounted() {
  }
}
</script>
<style lang="less">
@import '../css/qq.less';
</style>
<style lang="less" scoped>
  .canvas {
    width: 10px;
  }
  .chat{
    width: 100%;
    height: 100%;
    display: flex;
    position: relative;
    flex-direction: column;
    overflow: hidden;
    .van-pull-refresh {
      flex: 1;
      overflow-y: scroll;
      background-color: #f5f5f5;
      padding: 0 15px;
      .chat-record {
        min-height: 100%;
        position: relative;
      }
      .chat-item{
        margin: 15px 0;
        .create-time{
          display: flex;
          margin: 25px 0 15px;
          justify-content: center;
          span{
            display: inline-block;
            background-color: #eeeeee;
            color: #999999;
            height: 24px;
            line-height: 24px;
            border-radius: 4px;
            padding: 0 10px;
            font-size: 12px;
          }
        }
        .left{
          display:flex;
          flex-direction:row;
          align-items: flex-start;
          .user-head{
            width: 40px;
            height: 40px;
            border-radius: 4px;
          }
          .content{
            margin-left: 10px;
            max-width:240px;
            min-width:20px;
            min-height:40px;
            background-color: #ffffff;
            font-size: 14px;
            line-height: 24px;
            color: #101010;
            padding: 10px;
            border-radius: 8 8px 8px 8px;
          }
          .image{
            margin-left: 10px;
            max-width:200px;
            height:auto;
            border-radius: 8px;
            border: 0.5px solid #dddddd;
            background-color: #ffffff;
          }
          .voice-wrap{
            margin-left: 10px;
            display: flex;
            background-color: #ffffff;
            align-items: center;
            padding: 10px 15px;
            border-radius: 0 8px 8px 8px;
            img{
              width: 20px;
              height: 20px;
              margin-right: 5px;
            }
            span{
              font-size: 14px;
              color: #101010;
            }
          }
        }
        .right{
          display:flex;
          flex-direction:row-reverse;
          align-items: flex-start;
          .content{
            // margin-right: 10px;
            max-width:240px;
            min-width:20px;
            min-height:40px;
            background-color: #9EEA6A;
            font-size: 15px;
            line-height: 24px;
            color: #101010;
            padding: 10px;
            border-radius: 8px 8px 8px 8px;
            text-align: justify;
            word-break: break-all;
          }
          .image{
            margin-right: 10px;
            max-width:200px;
            height:auto;
            border-radius: 8px;
            border: 0.5px solid #eeeeee;
            background-color: #ffffff;
          }
          .voice-wrap{
            margin-right: 10px;
            display: flex;
            background-color: #9EEA6A;
            align-items: center;
            padding: 10px 15px;
            border-radius: 8px 8px 8px 8px;
            img{
              width: 20px;
              height: 20px;
              margin-right: 5px;
            }
            span{
              font-size: 15px;
              color: #101010;
            }
          }
        }
        .user-head{
          width: 40px;
          height: 40px;
          border-radius: 4px;
        }
      }
      .access-wrap{
        margin: 40px 0 20px;
        width: 100%;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        .tip{
          font-size: 12px;
          color: #999999;
        }
        .btn{
          color: #3a8ee6;
          font-size: 12px;
          margin-left: 15px;
        }
      }
    }
    .loading {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(143, 143, 143, 0.733);
      position: absolute;
      top: 0;
      left: 100vw;
      z-index: 10;
      transition: all 0.3s linear;
      user-select: none;
    }
    .bottom-wrap{
      // min-height: 54px;
      background-color: #f5f5f5;
      border-top: 0.5px solid #dddddd;
      // display: flex;
      // align-items: center;
      .line {
        width: 100%;
        display: flex;
        align-items: center;
        padding: 7px 0;
        border-bottom: 0.5px solid #dddddd;
        .voice-wrap{
          height: 40px;
          padding: 5px 0;
          margin: 0 15px;
          .voice{
            width: 30px;
            height: 30px;
          }
        }
        .el-textarea {
          flex: 1;
          // height: 36px;
        }
        .use-voice{
          flex: 1;
          width: 100%;
          height: 36px;
          background-color: #ffffff;
          line-height: 36px;
          text-align: center;
          color: #333333;
          font-size: 15px;
          border-radius: 4px;
          -webkit-touch-callout: none; /* iOS Safari 不能选择复制*/
          -webkit-user-select: none; /* Chrome/Safari/Opera */
          -moz-user-select: none; /* Firefox */
          -ms-user-select: none; /* Internet Explorer/Edge */
          user-select: none; /* Non-prefixed version, currently not supported by any browser */
        }
        .emoji{
          width: 30px;
          height: 30px;
          margin: 5px 0 5px 10px;
        }
        .right-icon-wrap{
          height: 40px;
          padding: 5px 0;
          margin: 0 10px;
          .more{
            width: 30px;
            height: 30px;
          }
          .btn{
            height: 30px;
            width: 50px;
            font-size: 14px;
            color: #ffffff;
            background-color: #00AE0E;
            border-radius: 4px;
            line-height: 30px;
            text-align: center;
          }
        }
      }
      .qqface-container{
        overflow-y: scroll;
        width: 100%;
        height: 200px;
        padding: 0 0 0 15px;
        background-color: #f5f5f5;
        .qqface-wrapper{
          display: inline-block;
          transform: scale(1.2);
          margin: 12px
        }
      }
      .tool{
        height: 200px;
        padding: 30px;
        display: flex;
        background-color: #f5f5f5;
        .image-wrap{
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-right: 30px;
          .image{
            display: flex;
            align-items: center;
            justify-content: center;
            width: 45px;
            height: 45px;
            background-color: #ffffff;
            border-radius: 10px;
            margin-bottom: 5px;
            img{
              width: 24px;
              height: auto;
            }
          }
          span{
            display: inline-block;
            text-align: center;
            font-size: 12px;
            color: #666666;
            width: 100%;
          }
        }
      }
    }
    .voicing{
      position: fixed;
      z-index: 99;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      user-select: none;
      .shadow{
        background-color: rgba(40,40,40,0.8);
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .gif-wrap{
          width: 200px;
          height: 100px;
          background-color: #ffffff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          img{
            height: 80px;
            width: auto;
          }
        }
        .tip{
          margin-top: 20px;
          text-align: center;
          color: #ffffff;
          font-size: 14px;
        }
      }
      .voice-btn{
        position: absolute;
        z-index: 199;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 140px;
        border-radius: 60px 60px 0 0;
        border-top: 4px solid #ffffff;
        background-color: #eeeeee;
        display: flex;
        align-items: center;
        justify-content: center;
        img{
          width: 24px;
          height: 24px;
        }
      }
    }
    .remark{
      // position: sticky;
      position: fixed;
      width: 40px;
      height: 40px;
      background-color: #FD8525;
      border-radius: 40px;
      font-size: 12px;
      line-height: 40px;
      text-align: center;
      color: #ffffff;
      // bottom: 70px;
      right: 10px;
      // left: 100%;
      // margin-top: 100%;
      box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
      //-webkit-touch-callout:none;
      //-webkit-user-select:none;
      //-moz-user-select:none;
      //-ms-user-select:none;
      //user-select:none;
      //pointer-events: none;
    }
    .wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    .remark-wrap {
      width: 80%;
      background-color: #fff;
      border-radius: 10px;
      padding: 20px 10px;
      .van-radio{
        // margin-right: 20px;
        margin-bottom: 20px;
      }
      .van-radio:last-child {
        margin-bottom: 0;
      }
      .btn-wrap{
        height: 50px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-around;
        margin-top: 20px;
        .cancel{
          width: 80px;
          height: 40px;
          text-align: center;
          line-height: 40px;
          font-size: 14px;
          color: #999999;
          border: 1px solid #F0F0F2;
          border-radius: 4px;
        }
        .submit{
          width: 80px;
          height: 40px;
          text-align: center;
          line-height: 40px;
          font-size: 14px;
          color: #ffffff;
          background-color: #3a8ee6;
          border-radius: 4px;
        }
    }
    }
  }
</style>
