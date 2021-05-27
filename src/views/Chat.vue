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
            <div class="content" v-if="item.msgtype != 'text'">
              <!-- <span v-if="item.msgtype == 'text'">{{item.content}}</span> -->
              <img class="content-img" v-if="item.msgtype == 'image'" referrerPolicy="no-referrer" :src="item.url" @click="viewImg(item.url)">
              <span class="voice" v-if="item.msgtype == 'voice'" @click="playAmr(item)">
                <svg t="1621498480105" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8192" width="18" height="18"><path d="M529.1 901.6c-2.7 0-12.1-4.1-17-9l-0.3-0.3-230.4-190.1H96.1c-8.9 0-18.3-4.6-22.7-9-4.4-4.4-9-13.8-9-22.7v-319c0-7 2.7-12.9 4.4-14.6H71l2.4-2.4c4.4-4.4 13.8-9 22.7-9h185.3l230.4-195.8 0.2-0.2c5.8-5.8 12.9-7 17.8-7 4.4 0 8.9 1 12.6 2.9l0.5 0.3 0.5 0.2c12.5 4.2 17.2 11.3 17.2 26.4v717.8c0 15.1-4.7 22.3-17.2 26.4l-1.8 0.6-1.4 1.4c-3 3-5.6 3.1-11.1 3.1z m279.1-79.7c-9.9 0-23.1-5.1-26.9-12.6-9-18-5.8-36.4 7.9-46.1 4.8-2 11.6-7.2 20.3-15.6 8.9-8.7 22.4-23.7 36.2-45.7 23-36.8 50.4-99.7 50.4-190.9s-29-154.2-53.3-191.1c-14.5-22-28.8-37-38.2-45.6-6.6-6.1-14.9-13-21-15.5-12.6-9.1-17-31.4-8.9-44.5 9.4-9.1 20.6-14.3 30.8-14.3 5.4 0 10.4 1.4 14.8 4.2 0.7 0.6 1.6 1.3 3 2.4 29.4 23.1 54.9 51.4 75.8 84.1 40.1 62.9 60.5 137 60.5 220.3 0 83.7-19.7 158.1-58.4 221.1-20.1 32.7-44.5 60.9-72.6 83.6-1.7 1.4-2.6 2.1-3.3 2.8-3.4 3.4-13.3 3.4-17.1 3.4zM688.6 696.6c-8.3 0-22.6-9.7-26.9-18.3l-0.2-0.5-0.3-0.4c-8.2-12.4 0.8-30.4 14.5-39.7 6.4-3.4 60.9-35.5 60.9-132.3 0-46.5-18-78.4-33.2-97-16.5-20.2-33.1-29.4-33.7-29.8l-0.6-0.3-0.7-0.2c-5.8-1.9-11.4-8.5-14.3-16.8-2.9-8.3-2.3-16.6 1.4-22.2l0.6-0.9 0.3-1c2.9-8.6 15.6-16.1 27.3-16.1 4.5 0 8.6 1.1 11.7 3.2l2.1 1.4h1.5c4.5 1.7 29.1 14 53.5 41.9 21.7 24.9 47.6 68.1 47.6 132.2 0 72.9-24.5 120.2-45 147.1-22.6 29.5-45.6 42.2-50.4 44.1h-2.4l-2.4 2.4c-3.2 3-5.7 3.2-11.3 3.2z" fill="" p-id="8193"></path></svg>
                {{item.voiceTime}}″
              </span>
              <span v-if="item.msgtype != 'text' && item.msgtype != 'image' && item.msgtype != 'voice'">【收到不支持的消息类型，暂无法显示】</span>
            </div>
            <div class="content" v-else v-html="item.html"></div>
          </div>
        </template>
      </div>
    </van-pull-refresh>
    <div class="input-area">
      <div class="line">
        <svg @click="showInput" v-show="!recordIcon" t="1621238312635" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3442" width="30" height="30"><path d="M512 65c246.319 0 446 199.681 446 446S758.319 957 512 957 66 757.319 66 511 265.681 65 512 65z m0 59.773c-213.307 0-386.227 172.92-386.227 386.227S298.693 897.227 512 897.227 898.227 724.307 898.227 511 725.307 124.773 512 124.773z m140.227 549.454c12.702 0 23 10.297 23 23v34.464c0 12.702-10.298 23-23 23H374.072c-12.702 0-23-10.298-23-23v-34.464c0-12.703 10.298-23 23-23h278.155zM466.01 500.655c12.703 0 23 10.297 23 23v64.35c0 12.703-10.297 23-23 23h-66.65c-12.702 0-23-10.297-23-23v-64.35c0-12.703 10.298-23 23-23h66.65z m160.928 0c12.703 0 23 10.297 23 23v64.35c0 12.703-10.297 23-23 23h-66.65c-12.702 0-23-10.297-23-23v-64.35c0-12.703 10.298-23 23-23h66.65z m-324.154-1.15c12.702 0 23 10.298 23 23v64.35c0 12.703-10.298 23-23 23h-66.65c-12.703 0-23-10.297-23-23v-64.35c0-12.702 10.297-23 23-23h66.65z m487.38 0c12.703 0 23 10.298 23 23v64.35c0 12.703-10.297 23-23 23h-66.649c-12.702 0-23-10.297-23-23v-64.35c0-12.702 10.298-23 23-23h66.65zM466.01 339.727c12.703 0 23 10.297 23 23v64.35c0 12.703-10.297 23-23 23h-66.65c-12.702 0-23-10.297-23-23v-64.35c0-12.703 10.298-23 23-23h66.65z m160.928 0c12.703 0 23 10.297 23 23v64.35c0 12.703-10.297 23-23 23h-66.65c-12.702 0-23-10.297-23-23v-64.35c0-12.703 10.298-23 23-23h66.65z m-324.154-1.15c12.702 0 23 10.298 23 23v64.35c0 12.703-10.298 23-23 23h-66.65c-12.703 0-23-10.297-23-23v-64.35c0-12.702 10.297-23 23-23h66.65z m487.38 0c12.703 0 23 10.298 23 23v64.35c0 12.703-10.297 23-23 23h-66.649c-12.702 0-23-10.297-23-23v-64.35c0-12.702 10.298-23 23-23h66.65z" fill="#333333" p-id="3443"></path></svg>
        <div class="record-btn" v-show="!recordIcon">
          按住说话
        </div>
        <svg @click="showRecordButton" v-show="recordIcon" t="1621238786333" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18580" width="30" height="30"><path d="M431.207929 106.919125c-14.536065-5.991458-30.570249-2.454912-41.684378 8.683776L198.703551 308.032562l-94.77862 0c-21.468964 0-38.633902 17.024745-38.633902 38.486546l0 331.002716c0 21.460778 17.164938 38.485523 38.633902 38.485523l94.77862 0 191.521988 192.429661c7.446599 7.467065 17.411555 11.530614 27.557636 11.530614 4.992711 0 8.626471-0.915859 13.424754-2.89391 14.545274-6.005784 22.63144-20.143783 22.63144-35.874045L453.839369 142.839219C453.838346 127.108956 445.753203 112.924909 431.207929 106.919125zM376.128473 787.108708 241.016239 649.917116c-7.299243-7.320733-15.827477-11.618619-26.163893-11.618619l-71.852468 0L142.999878 385.742435l71.852468 0c10.336416 0 18.86465-4.297886 26.163893-11.618619l135.112234-137.191592L376.128473 787.108708zM581.9 676.526147c-7.67889 8.590656-18.318204 12.96529-29.000498 12.96529-9.221012 0-18.47477-3.25923-25.891693-9.886161-16.011672-14.302751-17.388019-38.870286-3.080152-54.870702 97.04729-108.533902 10.117428-213.893508-0.113587-225.548966-14.113439-16.081257-12.632715-40.605813 3.388167-54.78986 16.020882-14.189164 40.431851-12.817933 54.697763 3.1262C632.777761 404.416749 698.252984 546.403554 581.9 676.526147zM699.338712 780.485871c-7.677866 8.591679-18.318204 12.96529-29.000498 12.96529-9.219989 0-18.478863-3.25923-25.891693-9.885138-16.010649-14.302751-17.388019-38.871309-3.079128-54.871725 191.540408-214.210733 7.91118-424.49811 0-433.345616-14.307867-16.000416-12.93152-40.568974 3.079128-54.871725 15.997346-14.302751 40.575114-12.927427 54.892191 3.079128C701.739389 246.240217 936.651606 515.090385 699.338712 780.485871zM821.955354 858.351286c-7.67889 8.590656-18.318204 12.96529-29.000498 12.96529-9.221012 0-18.47477-3.25923-25.891693-9.886161-16.011672-14.302751-17.388019-38.870286-3.080152-54.870702 109.224634-122.153084 142.595672-257.939677 99.177813-403.597081-32.952506-110.559025-98.518804-184.728258-99.177813-185.468109-14.307867-16.000416-12.93152-40.564881 3.080152-54.871725 15.992229-14.306844 40.568974-12.930497 54.892191 3.079128C825.049832 169.162748 1128.098893 515.981684 821.955354 858.351286z" p-id="18581"></path></svg>
        <van-field
          v-show="recordIcon"
          class="input-text"
          border
          v-model="message"
          rows="1"
          :autosize="{ maxHeight: 50, minHeight: 25 }"
          type="textarea"
          :readonly="readonly"
          @focus="textFocus"
          @blur="textBlur"
          @click="textClick"
          @input="textInput"
        />
        <svg @click="showKeyBoard" v-show="emojiIcon" t="1621238462590" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4372" width="30" height="30"><path d="M512.016 1024C229.232 1024 0.016 794.784 0.016 512 0.016 229.216 229.232 0 512.016 0 794.784 0 1024 229.216 1024 512 1024 794.784 794.784 1024 512.016 1024ZM512.016 64C264.976 64 64.016 264.96 64.016 512 64.016 759.024 264.976 960 512.016 960 759.04 960 960 759.024 960 512 960 264.96 759.04 64 512.016 64ZM510.336 833.456C509.056 833.456 507.744 833.488 506.448 833.488 310.992 833.488 229.024 657.12 225.616 649.552 218.336 633.424 225.488 614.496 241.584 607.216 257.712 599.968 276.576 607.088 283.888 623.088 286.64 629.12 352.928 769.488 506.576 769.488 507.584 769.488 508.576 769.456 509.584 769.456 672.896 767.552 738.368 624.768 739.024 623.344 746.176 607.216 765.024 599.872 781.264 607.152 797.392 614.336 804.672 633.248 797.456 649.408 794.176 656.8 714.208 831.056 510.336 833.456ZM671.504 479.84C636.224 479.84 607.664 451.232 607.664 415.984 607.664 380.768 636.224 352.176 671.504 352.176 706.768 352.176 735.344 380.768 735.344 415.984 735.344 451.232 706.768 479.84 671.504 479.84ZM351.504 479.84C316.224 479.84 287.664 451.232 287.664 415.984 287.664 380.768 316.224 352.176 351.504 352.176 386.768 352.176 415.344 380.768 415.344 415.984 415.344 451.232 386.768 479.84 351.504 479.84Z" p-id="4373"></path></svg>
        <svg @click="showEmoji" v-show="keyBoardIcon" t="1621238312635" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3442" width="30" height="30"><path d="M512 65c246.319 0 446 199.681 446 446S758.319 957 512 957 66 757.319 66 511 265.681 65 512 65z m0 59.773c-213.307 0-386.227 172.92-386.227 386.227S298.693 897.227 512 897.227 898.227 724.307 898.227 511 725.307 124.773 512 124.773z m140.227 549.454c12.702 0 23 10.297 23 23v34.464c0 12.702-10.298 23-23 23H374.072c-12.702 0-23-10.298-23-23v-34.464c0-12.703 10.298-23 23-23h278.155zM466.01 500.655c12.703 0 23 10.297 23 23v64.35c0 12.703-10.297 23-23 23h-66.65c-12.702 0-23-10.297-23-23v-64.35c0-12.703 10.298-23 23-23h66.65z m160.928 0c12.703 0 23 10.297 23 23v64.35c0 12.703-10.297 23-23 23h-66.65c-12.702 0-23-10.297-23-23v-64.35c0-12.703 10.298-23 23-23h66.65z m-324.154-1.15c12.702 0 23 10.298 23 23v64.35c0 12.703-10.298 23-23 23h-66.65c-12.703 0-23-10.297-23-23v-64.35c0-12.702 10.297-23 23-23h66.65z m487.38 0c12.703 0 23 10.298 23 23v64.35c0 12.703-10.297 23-23 23h-66.649c-12.702 0-23-10.297-23-23v-64.35c0-12.702 10.298-23 23-23h66.65zM466.01 339.727c12.703 0 23 10.297 23 23v64.35c0 12.703-10.297 23-23 23h-66.65c-12.702 0-23-10.297-23-23v-64.35c0-12.703 10.298-23 23-23h66.65z m160.928 0c12.703 0 23 10.297 23 23v64.35c0 12.703-10.297 23-23 23h-66.65c-12.702 0-23-10.297-23-23v-64.35c0-12.703 10.298-23 23-23h66.65z m-324.154-1.15c12.702 0 23 10.298 23 23v64.35c0 12.703-10.298 23-23 23h-66.65c-12.703 0-23-10.297-23-23v-64.35c0-12.702 10.297-23 23-23h66.65z m487.38 0c12.703 0 23 10.298 23 23v64.35c0 12.703-10.297 23-23 23h-66.649c-12.702 0-23-10.297-23-23v-64.35c0-12.702 10.298-23 23-23h66.65z" fill="#333333" p-id="3443"></path></svg>
        <svg @click="showAdd" t="1621300331087" v-show="addIcon" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1859" width="30" height="30"><path d="M852.812 166.713c-92.715-89.28-212.9-140.789-339.954-140.789s-250.672 51.509-339.953 140.79c-188.863 188.862-188.863 491.043 0 679.906 89.28 89.28 212.9 140.789 339.953 140.789S763.531 935.9 852.812 846.62c188.863-188.863 188.863-491.044 0-679.907m-48.074 631.833c-78.98 78.979-181.996 120.185-291.88 120.185s-212.9-41.206-291.879-120.185c-161.392-161.392-161.392-422.367 0-583.759 78.98-78.979 181.996-120.185 291.88-120.185s212.9 41.206 291.879 120.185c161.392 161.392 161.392 422.367 0 583.759" fill="#515151" p-id="1860"></path><path d="M547.197 472.328V297.2c0-20.603-13.735-34.338-34.339-34.338S478.52 276.597 478.52 297.2v175.128H303.392c-20.603 0-34.339 13.735-34.339 34.339 0 10.301 3.434 17.169 10.302 24.037s13.736 10.301 24.037 10.301H478.52v175.128c0 10.302 3.434 17.17 10.301 24.037 6.868 6.868 13.736 10.302 24.037 10.302 20.604 0 34.34-13.736 34.34-34.34V541.006h175.127c20.603 0 34.338-13.735 34.338-34.338s-13.735-34.34-34.338-34.34H547.197z" fill="#515151" p-id="1861"></path></svg>
        <van-button type="primary" :loading="sendLoading" v-show="!addIcon" class="send-btn" size="small" :border="false" @click="send">发送</van-button>
      </div>
      <div v-show="show" class="qqface-container">
        <span class="qqface-wrapper" v-for="(item, idx) in testList" :key="idx">
          <img src="/qqface.png" class="qqface" :class="[`qqface${idx}`]" @click="addEmoji(idx)">
        </span>
      </div>
      <div v-show="tool" class="tool">
        <van-uploader class="tool-item" :after-read="afterRead">
          <div class="tool-item">
            <svg t="1621406840035" class="icon" viewBox="0 0 1297 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12827" width="48" height="48"><path d="M1158.690133 747.1104V146.432H138.103467v520.260267L470.4256 384.341333l330.205867 327.543467 176.605866-163.84 181.384534 199.0656z m102.4-703.0784v918.596267H35.703467V44.032h1225.386666z" fill="#333333" p-id="12828"></path></svg>
            <span>相册</span>
          </div>
        </van-uploader>
      </div>
    </div>
    <div class="loading" :style="{left: sendMessage ? 0 : '100vw'}">
      <van-loading size="24px" vertical color="#fff">发送图片中...</van-loading>
    </div>
    <div class="record-vocie" v-show="isRecording">
      <div>上滑取消录音</div>
    </div>
    <van-image-preview v-model="viewImage" :images="imgList">
    </van-image-preview>
  </div>
</template>
<script>
import testApi from '@/api/test.js'
import BenzAMRRecorder from 'benz-amr-recorder'

export default {
  name: 'Chat',
  data () {
    return {
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
      isRecording: false,
      recordIcon: true,
      viewImage: false,
      testList: new Array(109),
      sendMessage: false,
      tool: false,
      isLoading: false,
      keyBoardIcon: false,
      emojiIcon: true,
      show: false,
      addIcon: true,
      cancelKeyBoard: false,
      readonly: false,
      sendLoading: false,
      showTool: false,
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
      selectionStart: 0,
      userName: this.$route.query.userName,
      sessionCreateTime: Number(this.$route.query.createTime),
      headImg: this.$route.query.headImg,
      clientImg: '',
      list: [],
      amr: new BenzAMRRecorder(),
      amrRecord: new BenzAMRRecorder(),
      interVal: null,
      successText: '加载成功',
      paddingBottom: 70,
      selectionStart: 0,
      imgList: [],
      clientY: 0
    }
  },
  computed: {
    addBottom () {
      if (this.show || this.tool) {
        return 250
      } else {
        return 0
      }
    }
  },
  methods: {
    mouseDown (e) {
      this.isRecording = true
      this.amrRecord = new BenzAMRRecorder()
      this.amrRecord.initWithRecord().then(() => {
        this.amrRecord.startRecord()
        this.clientY = e.touches[0].clientY
        addEventListener('touchmove', this.mouseMove)
      })
    },
    mouseEnd () {
      this.amrRecord.finishRecord().then(() => {
        removeEventListener('touchmove', this.mouseMove)
        this.isRecording = false
        this.amr.stop()
        this.amr = new BenzAMRRecorder()
        let file = this.amrRecord.getBlob()
        let voiceTime = Math.ceil(this.amrRecord.getDuration())
        this.sendVoice(file, voiceTime)
        this.amr.initWithBlob(file).then(() => {
          this.amr.play()
        })
      })
    },
    mouseMove (e) {
      if ((this.clientY - e.targetTouches[0].clientY) > 100 ) {
        this.amrRecord.cancelRecord()
        this.isRecording = false
        removeEventListener('touchmove', this.mouseMove)
      }
    },
    sendVoice(file, voiceTime) {
      clearInterval(this.interVal)
      const time = new Date().getTime()
      this.nextForm.start = time + 1
      let formData = new FormData()
      formData.append('voice', file)
      console.log(file)
      testApi.snedVoice({
        time,
        appId: this.prevForm.appId,
        openId: this.prevForm.openId,
        voiceTime
      },formData).then(() => {
        let msg = {
          msgtype: 'voice',
          content: '',
          createTime: time,
          headImg: this.clientImg,
          url: window.URL.createObjectURL(file),
          voiceTime
        }
        this.list.push(msg)
        // this.addIcon = false
        // this.resetBool()
      }).finally(() => {
        // this.sendMessage = false
        this.interVal = setInterval(this.getNext, 2000)
        this.scrollToBottom()
      })
    },
    showInput () {
      this.recordIcon = true
      this.show = false
      setTimeout(() => {
        document.querySelector('.van-field__control').focus()
      }, 200)
    },
    showRecordButton () {
      this.recordIcon = false
      this.show = false
      let recordBtn = document.querySelector('.record-btn')
      recordBtn.addEventListener('touchstart', this.mouseDown)
      recordBtn.addEventListener('touchend', this.mouseEnd)
    },
    viewImg (url) {
      this.imgList = [url]
      this.viewImage = true
    },
    afterRead (file) {
      console.log(file)
      clearInterval(this.interVal)
      const time = new Date().getTime()
      this.nextForm.start = time + 1
      let formData = new FormData()
      formData.append('image', file.file)
      this.sendMessage = true
      testApi.sendImg({
        time,
        appId: this.prevForm.appId,
        openId: this.prevForm.openId,
      }, formData).then(() => {
        let msg = {
          msgtype: 'image',
          content: '',
          createTime: time,
          headImg: this.clientImg,
          url: file.content
        }
        this.list.push(msg)
        // this.addIcon = false
        this.resetBool()
      }).finally(() => {
        this.sendMessage = false
        this.interVal = setInterval(this.getNext, 2000)
        this.scrollToBottom()
      })
    },
    showAdd () {
      this.tool = true
      this.scrollToBottom()
      this.resetBool()
    },
    addEmoji (idx) {
      this.message = this.message.slice(0, this.selectionStart) + this.reverseMap[idx] + this.message.slice(this.selectionStart)
      this.cancelKeyBoard = true
      this.readonly = true
      this.selectionStart += this.reverseMap[idx].length
      this.addIcon = false
      document.querySelector('.van-field__control').focus()
    },
    resetBool () {
      this.readonly = false
      this.cancelKeyBoard = false
      this.addIcon = true
      this.show = false
      this.emojiIcon = true
      this.keyBoardIcon = false
      this.isLoading = false
    },
    scrollToBottom (delay = 200) {
      setTimeout(() => {
        let van = document.querySelector('.van-pull-refresh')
        // let vanHiehgt = van.offsetHeight || van.clientHeight
        let recordHeight = document.querySelector('.chat-record').scrollHeight || document.querySelector('.chat-record').offsetHeight
        van.scrollTop = recordHeight
      }, delay)
    },
    textInput (val) {
      let strTrim = val.trim()
      if (strTrim.length > 0) {
        this.addIcon = false
      } else {
        this.addIcon = true
      }
      this.selectionStart = document.querySelector('.van-field__control').selectionStart
    },
    textClick (e) {
      console.log('click')
      if (!this.cancelKeyBoard) {
        this.show = false,
        this.emojiIcon = true
        this.keyBoardIcon = false
        this.tool = false
      }
      e.srcElement.selectionStart = this.selectionStart
      e.srcElement.selectionEnd = this.selectionStart
      this.scrollToBottom()
    },
    textBlur (e) {
      if (!this.cancelKeyBoard) {
        this.selectionStart = e.srcElement.selectionStart
      }
    },
    textFocus (e) {
      console.log('focus')
      if (!this.cancelKeyBoard) {
        this.show = false,
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
    },
    showKeyBoard () {
      this.cancelKeyBoard = true
      this.show = true
      this.emojiIcon = false
      this.tool = false
      this.keyBoardIcon = true
      this.readonly = true
      this.scrollToBottom()
      document.querySelector('.van-field__control').focus()
    },
    showEmoji () {
      this.show = false
      this.emojiIcon = true
      this.tool = false
      this.keyBoardIcon = false
      document.querySelector('.van-field__control').blur()
      document.querySelector('.van-field__control').focus()
    },
    playAmr (row) {
      console.log(this.amr.isPlaying())
      this.amr.stop()
      // console.log(amr.isPlaying())
      this.amr = new BenzAMRRecorder()
      this.amr.initWithUrl(row.url).then(() => {
        this.amr.play()
      })
    },
    send () {
      if (this.message) {
        this.sendLoading = true
        clearInterval(this.interVal)
        const time = new Date().getTime()
        this.nextForm.start = time + 1
        testApi.sendText({
          time,
          appId: this.prevForm.appId,
          openId: this.prevForm.openId,
          content: this.message
        }).then(() => {
          let msg = {
            msgtype: 'text',
            content: this.message,
            createTime: time,
            headImg: this.clientImg,
            html: this.genString2emoji(this.message)
          }
          this.list.push(msg)
          this.message = ''
          // this.addIcon = false
          this.resetBool()
        }).finally(() => {
          this.sendLoading = false
          this.interVal = setInterval(this.getNext, 2000)
          this.scrollToBottom()
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
            if (res[i].fromId !== this.prevForm.openId && !this.clientImg) {
              this.clientImg = res[i].headImg
            }
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
            } else {
              // res[i].html = this.genString2emoji(res[i].content)
            }
          }
          switch (type) {
            case 'init' : { // 首次进入 第一次拉取到信息后 滚到底
              this.list = this.list.concat(res.reverse())
              this.scrollToBottom()
              break
            }
            case 'prev' : 
              this.list = res.reverse().concat(this.list)
              this.isLoading = false
              break
            case 'next' :
              this.list = this.list.concat(res.reverse())
              this.scrollToBottom(200)
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
      this.scrollToBottom()
    },
    genString2emoji (words) {
      const keys1 = words.match(/\[(.+?)\]/g) || []
      const keys2 = words.match(/\/\:[^\u4e00-\u9fa5^\/^0^1^2^3^4^5^6^7^9^\s]*/g) || []
      let result = words
      let that = this
      for (const key1 of keys1) {
        if (this.qqFaceMap[key1]) {
          result = result.replace(key1, `<span style="display: inline-block;" class="qqface-wrapper"><img src="/qqface.png" class="qqface qqface${that.qqFaceMap[key1]}"></span>`)
        }
      }
      for (const key2 of keys2) {
        if (this.qqFaceMap[key2]) {
          result = result.replace(key2, `<span style="display: inline-block;" class="qqface-wrapper"><img src="/qqface.png" class="qqface qqface${that.qqFaceMap[key2]}"></span>`)
        }
      }
      return result
    }
  },
  created () {
    this.search('init')
    this.interVal = setInterval(this.getNext, 2000)
    window.addEventListener('resize', this.inputAreaIntoView)
  },
  beforeDestroy () {
    clearInterval(this.interVal)
    window.removeEventListener('resize', this.inputAreaIntoView)
  }
}
</script>

<style lang="less">
@import '../css/qq.less';
</style>

<style lang="less" scoped>
  .chat {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    background-color: rgba(233, 233, 233, 0.733);
    padding-bottom: 70px;
    padding-top: 50px;
    .van-pull-refresh {
      width: 100%;
      height: 100%;
      overflow-y: scroll;
      user-select: text;
    }
    .van-pull-refresh::-webkit-scrollbar {
      display: none;
    }
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
      user-select: none;
    }
    .chat-record {
      padding: 0 15px;
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
        .voice {
          display: flex;
          align-items: center;
          svg {
            margin-right: 5px;
          }
        }
        .img {
          width: 50px;
          height: 50px;
          // border: 1px solid black;
          // border-radius: 5px;
          .headImg {
            width: 100%;
            height: 100%;
            border-radius: 10px;
          }
        }
        .content {
          background-color: rgb(255, 255, 255);
          display: flex;
          align-items: center;
          max-width: 70%;
          min-width: 20px;
          padding: 5px 10px;
          word-break: break-all;
          word-wrap: break-word;
          border-radius: 10px;
          position: relative;
          flex-wrap: wrap;
          font-size: 16px;
          .content-img {
            width: 100%;
            height: auto;
            border-radius: 10px;
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
        .voice {
          flex-direction: row-reverse;
          svg {
            transform: rotate(180deg);
            margin-left: 5px;
            margin-right: 0;
          }
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
      bottom: 0;
      background-color: #fff;
      .line {
        display: flex;
        justify-content: space-around;
        align-items: center;
        // position: fixed;
        padding: 10px 0 ;
        width: 100%;
        min-height: 50px;
        // border: 1px solid black;
        // background-color: #fff;
        // box-shadow: 0px -1px 10px #c2c1c186;
        .send-btn {
          margin-right: 5px;
        }
        .icon {
          margin: 0 5px;
        }
        .input-text,
        .record-btn {
          // width: 80%;
          flex: 1;
          border-radius: 5px;
          border: 1px solid rgba(233, 233, 233, 0.733)
        }
        .record-btn {
          height: 50px;
          line-height: 50px;
          text-align: center;
          font-size: 18px;
          user-select: none;
        }
      }
      .qqface-container{
        overflow-y: scroll;
        width: 100%;
        height: 250px;
        padding: 0 0 0 10px;
        background-color: rgba(233, 233, 233, 0.733);
        .qqface-wrapper{
          display: inline-block;
          transform: scale(1.4);
          margin: 12px
        }
      }
      .tool {
        overflow-y: scroll;
        width: 100%;
        height: 250px;
        display: flex;
        justify-content: flex-start;
        background-color: rgba(233, 233, 233, 0.733);
        padding: 20px;
        .tool-item {
          width: calc((100vw - 50px) / 4);
          height: calc((100vw - 50px) / 4);
          // border: 1px solid black;
          background-color: #fff;
          border-radius: 10px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex-direction: column;
          font-size: 14px;
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
    .record-vocie {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background: rgba(95, 95, 95, 0.733) url('../assets/voicing.gif') no-repeat;
      background-size: 100%;
      background-position: center;
      > div {
        position: absolute;
        bottom: 200px;
        width: 100%;
        text-align: center;
        color: #fff;
      }
    }
  }
</style>
