<template>
  <div class="home">
    <!-- <van-button type="primary">主要按钮</van-button> -->
    <div class="chat-list-wrap">
      <div class="item" v-for="(item, idx) in list" :key="idx" @click="goChat(item)">
        <div class="img">
          <img :src="headImg" alt="">
        </div>
        <div class="main">
          <div class="title">{{item.userName}}.</div>
          <div class="content">{{item.appMsgRecord ? (item.appMsgRecord.userName ?  item.appMsgRecord.userName + ':' : item.userName + ':') : ''}}
            {{item.appMsgRecord ? (item.appMsgRecord.msgtype == 'image' ? '图片' : item.appMsgRecord.content) : ''}}
          </div>
        </div>
        <div class="time">{{item.appMsgRecord ? new Date(item.appMsgRecord.createTime).toLocaleTimeString() : ''}}</div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Home',
  data () {
    return {
      headImg: require('@/assets/headImg.jpg'),
      list: [{
        userName: 'CherryZ'
      },
      {
        userName: 'ZBaLoR'
      }]
    }
  },
  methods: {
    goChat(row) {
      console.log(row)
      this.$router.push({
        path: '/chat',
        query: {
          appId: row.appId,
          openId: 'asliduflasjdflj',
          start: row.newMessageTime,
          headImg: this.headImg,
          createTime: row.createTime,
          userName: row.userName
        }
      })
    }
  },
};
</script>

<style lang="less" scoped>
  .home {
    width: 100%;
    height: 100%;
    .chat-list-wrap {
      width: 100%;
      .item {
        border-top: 1px solid rgb(196, 196, 196);
        width: 100%;
        height: 80px;
        padding: 10px 10px;
        // border: 1px solid black;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .img {
          border: 1px solid rgb(187, 187, 187);
          width: 60px;
          height: 60px;
          border-radius: 15px;
          img {
            width: 100%;
            height: 100%;
            border-radius: inherit;
          }
        }
        .main {
          flex: 1;
          // border: 1px solid red;
          height: 60px;
          margin-left: 10px;
          margin-right: 5px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          .title {
            font-size: 18px;
            color: #000;
          }
          .content {
            font-size: 12px;
            color: rgb(153, 153, 153);
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
        .time {
          font-size: 12px;
          color: rgb(153, 153, 153);
          // width: 50px;
        }
      }
    }
  }
</style>
