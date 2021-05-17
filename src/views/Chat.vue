<template>
  <div class="chat" :style="{paddingBottom: paddingBottom + addBottom + 'px'}">
    <div class="header">{{userName}}</div>
    <van-pull-refresh v-model="isLoading" :success-text="successText" @refresh="getPrev">
      <template #pulling>
        <span>加载历史记录</span>
      </template>
      <template #loosing>
        <span>释放加载历史记录</span>
      </template>
      <div class="chat-record">
        <template v-for="(item, idx) in list">
          <div class="record" :class="{left : item.fromId == prevForm.openId, right: item.fromId != prevForm.openId }" :key="idx">
            <div class="img"><img class="headImg" :src="item.fromId == prevForm.openId ? headImg : item.headImg"></div>
            <div class="content">
              <span v-if="item.msgtype == 'text'">{{item.content}}</span>
              <img class="content-img" v-if="item.msgtype == 'image'" referrerPolicy="no-referrer" :src="item.url">
              <span v-if="item.msgtype == 'voice'" @click="playAmr(item)">语音:{{item.voiceTime}}″</span>
              <span v-if="item.msgtype != 'text' && item.msgtype != 'image' && item.msgtype != 'voice'">【收到不支持的消息类型，暂无法显示】</span>
            </div>
          </div>
          <!-- <div class="time" :key="idx">
            {{new Date().toLocaleTimeString()}}
          </div> -->
        </template>
      </div>
    </van-pull-refresh>
    <div class="input-area">
      <div class="line">
        <svg t="1621238786333" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18580" width="30" height="30"><path d="M431.207929 106.919125c-14.536065-5.991458-30.570249-2.454912-41.684378 8.683776L198.703551 308.032562l-94.77862 0c-21.468964 0-38.633902 17.024745-38.633902 38.486546l0 331.002716c0 21.460778 17.164938 38.485523 38.633902 38.485523l94.77862 0 191.521988 192.429661c7.446599 7.467065 17.411555 11.530614 27.557636 11.530614 4.992711 0 8.626471-0.915859 13.424754-2.89391 14.545274-6.005784 22.63144-20.143783 22.63144-35.874045L453.839369 142.839219C453.838346 127.108956 445.753203 112.924909 431.207929 106.919125zM376.128473 787.108708 241.016239 649.917116c-7.299243-7.320733-15.827477-11.618619-26.163893-11.618619l-71.852468 0L142.999878 385.742435l71.852468 0c10.336416 0 18.86465-4.297886 26.163893-11.618619l135.112234-137.191592L376.128473 787.108708zM581.9 676.526147c-7.67889 8.590656-18.318204 12.96529-29.000498 12.96529-9.221012 0-18.47477-3.25923-25.891693-9.886161-16.011672-14.302751-17.388019-38.870286-3.080152-54.870702 97.04729-108.533902 10.117428-213.893508-0.113587-225.548966-14.113439-16.081257-12.632715-40.605813 3.388167-54.78986 16.020882-14.189164 40.431851-12.817933 54.697763 3.1262C632.777761 404.416749 698.252984 546.403554 581.9 676.526147zM699.338712 780.485871c-7.677866 8.591679-18.318204 12.96529-29.000498 12.96529-9.219989 0-18.478863-3.25923-25.891693-9.885138-16.010649-14.302751-17.388019-38.871309-3.079128-54.871725 191.540408-214.210733 7.91118-424.49811 0-433.345616-14.307867-16.000416-12.93152-40.568974 3.079128-54.871725 15.997346-14.302751 40.575114-12.927427 54.892191 3.079128C701.739389 246.240217 936.651606 515.090385 699.338712 780.485871zM821.955354 858.351286c-7.67889 8.590656-18.318204 12.96529-29.000498 12.96529-9.221012 0-18.47477-3.25923-25.891693-9.886161-16.011672-14.302751-17.388019-38.870286-3.080152-54.870702 109.224634-122.153084 142.595672-257.939677 99.177813-403.597081-32.952506-110.559025-98.518804-184.728258-99.177813-185.468109-14.307867-16.000416-12.93152-40.564881 3.080152-54.871725 15.992229-14.306844 40.568974-12.930497 54.892191 3.079128C825.049832 169.162748 1128.098893 515.981684 821.955354 858.351286z" p-id="18581"></path></svg>
        <van-field
          class="input-text"
          v-model="message"
          rows="1"
          autosize
          type="textarea"
          @focus="textFocus"
        />
        <!-- <img src="@/assets/smile.png" alt=""> -->
        <svg @click="showEmoji" v-show="emoji" t="1621238462590" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4372" width="30" height="30"><path d="M512.016 1024C229.232 1024 0.016 794.784 0.016 512 0.016 229.216 229.232 0 512.016 0 794.784 0 1024 229.216 1024 512 1024 794.784 794.784 1024 512.016 1024ZM512.016 64C264.976 64 64.016 264.96 64.016 512 64.016 759.024 264.976 960 512.016 960 759.04 960 960 759.024 960 512 960 264.96 759.04 64 512.016 64ZM510.336 833.456C509.056 833.456 507.744 833.488 506.448 833.488 310.992 833.488 229.024 657.12 225.616 649.552 218.336 633.424 225.488 614.496 241.584 607.216 257.712 599.968 276.576 607.088 283.888 623.088 286.64 629.12 352.928 769.488 506.576 769.488 507.584 769.488 508.576 769.456 509.584 769.456 672.896 767.552 738.368 624.768 739.024 623.344 746.176 607.216 765.024 599.872 781.264 607.152 797.392 614.336 804.672 633.248 797.456 649.408 794.176 656.8 714.208 831.056 510.336 833.456ZM671.504 479.84C636.224 479.84 607.664 451.232 607.664 415.984 607.664 380.768 636.224 352.176 671.504 352.176 706.768 352.176 735.344 380.768 735.344 415.984 735.344 451.232 706.768 479.84 671.504 479.84ZM351.504 479.84C316.224 479.84 287.664 451.232 287.664 415.984 287.664 380.768 316.224 352.176 351.504 352.176 386.768 352.176 415.344 380.768 415.344 415.984 415.344 451.232 386.768 479.84 351.504 479.84Z" p-id="4373"></path></svg>
        <svg @click="showKeyBoard" v-show="keyBoard" t="1621238312635" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3442" width="30" height="30"><path d="M512 65c246.319 0 446 199.681 446 446S758.319 957 512 957 66 757.319 66 511 265.681 65 512 65z m0 59.773c-213.307 0-386.227 172.92-386.227 386.227S298.693 897.227 512 897.227 898.227 724.307 898.227 511 725.307 124.773 512 124.773z m140.227 549.454c12.702 0 23 10.297 23 23v34.464c0 12.702-10.298 23-23 23H374.072c-12.702 0-23-10.298-23-23v-34.464c0-12.703 10.298-23 23-23h278.155zM466.01 500.655c12.703 0 23 10.297 23 23v64.35c0 12.703-10.297 23-23 23h-66.65c-12.702 0-23-10.297-23-23v-64.35c0-12.703 10.298-23 23-23h66.65z m160.928 0c12.703 0 23 10.297 23 23v64.35c0 12.703-10.297 23-23 23h-66.65c-12.702 0-23-10.297-23-23v-64.35c0-12.703 10.298-23 23-23h66.65z m-324.154-1.15c12.702 0 23 10.298 23 23v64.35c0 12.703-10.298 23-23 23h-66.65c-12.703 0-23-10.297-23-23v-64.35c0-12.702 10.297-23 23-23h66.65z m487.38 0c12.703 0 23 10.298 23 23v64.35c0 12.703-10.297 23-23 23h-66.649c-12.702 0-23-10.297-23-23v-64.35c0-12.702 10.298-23 23-23h66.65zM466.01 339.727c12.703 0 23 10.297 23 23v64.35c0 12.703-10.297 23-23 23h-66.65c-12.702 0-23-10.297-23-23v-64.35c0-12.703 10.298-23 23-23h66.65z m160.928 0c12.703 0 23 10.297 23 23v64.35c0 12.703-10.297 23-23 23h-66.65c-12.702 0-23-10.297-23-23v-64.35c0-12.703 10.298-23 23-23h66.65z m-324.154-1.15c12.702 0 23 10.298 23 23v64.35c0 12.703-10.298 23-23 23h-66.65c-12.703 0-23-10.297-23-23v-64.35c0-12.702 10.297-23 23-23h66.65z m487.38 0c12.703 0 23 10.298 23 23v64.35c0 12.703-10.297 23-23 23h-66.649c-12.702 0-23-10.297-23-23v-64.35c0-12.702 10.298-23 23-23h66.65z" fill="#333333" p-id="3443"></path></svg>
        <van-button type="primary" size="small" :border="false" @click="send">发送</van-button>
      </div>
      <div class="emoji" v-show="show">
        <div v-for="(emoji, idx) in emojiList" :key="idx" @click="addEmoji(idx)">{{emoji.char}}</div>
      </div>
    </div>
  </div>
</template>
<script>
import testApi from '@/api/test.js'
import BenzAMRRecorder from 'benz-amr-recorder'
import emoji from 'emoji.json'
var amr = new BenzAMRRecorder()
export default {
  name: 'Chat',
  data () {
    return {
      isLoading: false,
      message: '',
      prevForm: {
        appId: this.$route.query.appId,
        openId: this.$route.query.openId,
        start: Number(this.$route.query.start) - 24 * 60 * 60 * 1000,
        end: new Date().getTime()
      },
      nextForm: {
        appId: this.$route.query.appId,
        openId: this.$route.query.openId,
        start: Number(this.$route.query.start) + 1,
        end: new Date().getTime()
      },
      userName: this.$route.query.userName,
      sessionCreateTime: Number(this.$route.query.createTime),
      headImg: this.$route.query.headImg,
      count: 0,
      list: [],
      amr: null,
      interVal: null,
      successText: '加载成功',
      keyBoard: false,
      emoji: true,
      show: false,
      emojiList: [],
      paddingBottom: 52,
      addBottom: 0
    }
  },
  methods: {
    textFocus () {
      this.show = false,
      this.emoji = true
      this.keyBoard = false
    },
    addEmoji (idx) {
      this.message += emoji[idx].char
    },
    showEmoji () {
      this.show = true
      this.emoji = false
      this.keyBoard = true
      console.log('here1')
    },
    showKeyBoard () {
      this.show = false
      this.emoji = true
      this.keyBoard = false
      console.log('here2')
    },
    playAmr (row) {
      console.log(amr.isPlaying())
      amr.stop()
      // console.log(amr.isPlaying())
      amr = new BenzAMRRecorder()
      amr.initWithUrl(row.url).then(function() {
        amr.play();
      });
    },
    send () {
      if (this.message) {
        const time = new Date().getTime()
        this.nextForm.start = time + 1
        testApi.sendText({
          time,
          appId: this.prevForm.appId,
          openId: this.prevForm.openId,
          content: this.message
        }).finally(() => {
          
          this.list.push({
            msgtype: 'text',
            content: this.message,
            createTime: time
          })
          this.message = ''
        })
      }
    },
    getPrev () {
      // this.isLoading = false;
      if (this.prevForm.start == this.sessionCreateTime) { // 已查出会话第一条信息
        this.successText = '已加载全部历史聊天记录'
        this.isLoading = false
        return
      }
      this.prevForm.end = this.list[0].createTime - 1
      this.prevForm.start = (this.prevForm.end - 24*60*60*1000) < this.sessionCreateTime ? (this.prevForm.end - 24*60*60*1000) : this.sessionCreateTime
      this.search('prev')
    },
    getNext () {
      this.nextForm.start = this.list[this.list.length - 1].createTime + 1
      this.nextForm.end = new Date().getTime()
      this.search('next')
    },
    search (type) {
      testApi.getMsgRecord(type == 'next' ? this.nextForm : this.prevForm).then(async res => {
        if (res.length > 0) {
          for(let i = 0; i < res.length; i++) {
            if (res[i].msgtype == 'image' || res[i].msgtype == 'voice') {
              if (!res[i].url) {
                await testApi.getMsgMedia({
                  appid: this.prevForm.appId,
                  mediaid: res[i].mediaId,
                  recordId: res[i].recordId
                }).then(obj => {
                  res[i].url = obj.url
                  res[i].voiceTime = obj.voiceTime
                })
              }
            }
          }
          switch (type) {
            case 'init' : { // 首次进入 第一次拉取到信息后 滚到底
              this.list = this.list.concat(res.reverse())
              this.$nextTick(() => {
                let van = document.querySelector('.van-pull-refresh')
                let vanHiehgt = van.clientHeight
                let recordHeight = document.querySelector('.chat-record').offsetHeight
                van.scrollTop = recordHeight - vanHiehgt
              })
              break
            }
            case 'prev' : 
              this.list = res.reverse().concat(this.list)
              this.isLoading = false
              break
            case 'next' :
              this.list = this.list.concat(res.reverse())
              setTimeout(function () {
                let van = document.querySelector('.van-pull-refresh')
                let vanHiehgt = van.clientHeight
                let recordHeight = document.querySelector('.chat-record').offsetHeight
                van.scrollTop = recordHeight - vanHiehgt
              }, 2000)
              break
          }
        } else {
          switch (type) {
            case 'init' :
              this.search('init')
              break
            case 'prev' :
              this.getPrev()
              break
            case 'next' :
              break
          }
        }
      })
    },
    inputAreaIntoView () {
      document.querySelector('.input-area').scrollIntoView(false)
    }
  },
  created () {
    this.search('init')
    this.interVal = setInterval(this.getNext, 2000)
    window.addEventListener('resize', this.inputAreaIntoView)
    console.log(emoji)
    this.emojiList = emoji.slice(0, 50)
  },
  watch: {
    show (newVal) {
      if (newVal) {
        this.addBottom = 250
      } else {
        this.addBottom = 0
      }
    }
  },
  beforeDestroy () {
    clearInterval(this.interVal)
    window.removeEventListener('resize', this.inputAreaIntoView)
  }
  
}
</script>

<style lang="less" scoped>
  .chat {
    width: 100%;
    height: 100%;
    background-color: rgba(233, 233, 233, 0.733);
    padding-bottom: 70px;
    padding-top: 50px;
    .van-pull-refresh {
      width: 100%;
      height: 100%;
      overflow-y: scroll ;
    }
    // .van-pull-refresh::-webkit-scrollbar {
    //   display: none;
    // }
    .header {
      width: 100%;
      height: 50px;
      text-align: center;
      line-height: 50px;
      background-color: #000;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 99;
      color: #fff;
    }
    .chat-record {
      padding: 0 15px;
      // width: 100%;
      // height: 100%;
      // overflow-y: scroll;
      .time {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 0 10px 0 ;
        color: rgb(153, 153, 153);
        font-size: 12px;
      }
      .record {
        width: 100%;
        position: relative;
        display: flex;
        padding: 0 0 10px 0;
        .img {
          width: 50px;
          height: 50px;
          // border: 1px solid black;
          border-radius: 15px;
          .headImg {
            width: 100%;
            height: 100%;
            border-radius: 15px;
          }
        }
        .content {
          background-color: rgb(255, 255, 255);
          // width: 70%;
          display: flex;
          align-items: center;
          max-width: 70%;
          padding: 5px 10px;
          // word-break: break-all;
          border-radius: 10px;
          position: relative;
          // line-height: 16px;
          font-size: 16px;
          .content-img {
            width: 100%;
            height: auto;
          }
        }
      }
      .left {
        .content {
          margin-left: 5px;
        }
      }
      .right {
        flex-direction: row-reverse;
        .content {
          margin-right: 5px;
          background-color: rgb(159, 220, 115);
        }
      }
    }
    // .chat-record::-webkit-scrollbar {
    //   display: none;
    // }
    .input-area {
      width: 100%;
      position: fixed;
      box-shadow: 0px -1px 10px #c2c1c186;
      background-color: #fff;
      .line {
        padding: 10px 0 ;
        display: flex;
        justify-content: space-around;
        align-items: center;
        // position: fixed;
        bottom: 0;
        width: 100%;
        min-height: 50px;
        // border: 1px solid black;
        // background-color: #fff;
        // box-shadow: 0px -1px 10px #c2c1c186;
        * {
          padding: 0 5px;
        }
        .input-text {
          // width: 80%;
          flex: 1;
          border-radius: 10px;
          border: 1px solid rgba(233, 233, 233, 0.733)
        }
      }
      .emoji {
        width: 100%;
        font-size: 25px;
        height: 250px;
        overflow-y: scroll;
        display: flex;
        flex-wrap: wrap;
        // align-items: center;
      }
    }

  }
</style>
