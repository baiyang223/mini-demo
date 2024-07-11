<template>
    <view class="container">
      <view class="record-layer" v-if="pageStatus === 0">
        <view style="text-align: center">
          <image src="/static/pause.jpg" style="width: 50px; height: 50px; background-color: #eeeeee;" v-show="longPress === '0' || longPress === '1'"></image>
          <image src="/static/play.jpg"
                 style="width:50px; height: 50px; background-color: #eeeeee;"
                 @click="touchendBtn"
                 v-show="longPress === '2'" ></image>
        </view>
        <view class="record-box">
          <!--
            默认状态为longPress为0 未开始（初始化状态），2进行中，1完成
            1,点击录音 开始录音，图标需变为进行中 longPress为2
            2，点击进行中图标 为录音完成，显示取消 完成按钮
          -->
          <!--        没有录过音频-->
          <view class="record-btn-layer" v-show="longPress == '2'||longPress == '0'">
            <!--         longpress 长按事件 -->
            <!--          touchend 会在手指从屏幕上离开按钮时触发。-->
            <!--          @touchend="touchendBtn()"-->
            <button class="record-btn" :class="longPress == '2'||longPress == '0'  ? 'record-btn-1' : 'record-btn-2'"  @click="longpressBtn()">
              <text>{{longPress == '1'||longPress == '0' ? '点击录音' : longPress == '2'?'说话中...':'-'}}</text>
            </button>
          </view>
          <!--       已经录过音频，长按删除，点击开始播放 -->
          <!--        <view class="record-btn-layer" v-if="longPress == '0'">-->
          <!--          <button class="record-btn" @longpress="delShow = true" @click="playBtn()" :class="playStatus == '1' ? 'record-btn-2' : 'record-btn-1'">-->
          <!--            <text>{{playStatus == '1' ? (count+'s') : '点击播放'}}</text>-->
          <!--          </button>-->
          <!--        </view>-->
          <!--        录制完成-->
          <view v-if="longPress === '1'">
            <!--          重新录制 秒改为0-->
            <button @click="longpressBtn('cancel')">取消</button>
            <!--          完成 显示 汇报音频正在处理-->
            <button @click="submit()">确定</button>
          </view>
          <!-- 语音音阶动画 -->
          <!--        longPress 2:开始录音 1:录音结束-->
          <view class="prompt-layer prompt-layer-1"  v-if="longPress == '2' || longPress == '1'">
            <view class="prompt-loader">
              <view class="em" v-for="(item,index) in 15" :key="index" ref="animatedElements"
                    :class="longPress === '1'?'pause-animation':''"></view>
            </view>
            <!--          需要修改为正在录制的秒数 需要修改为秒：毫秒格式-->
            <text class="p">{{ time + 's'}}</text>
            <!--          <text class="span">松手结束录音</text>-->
          </view>
          <!-- 删除 -->
          <view class="prompt-layer prompt-layer-2" v-if="delShow" @click.stop="delBtn()">
            <text>删除</text>
          </view>
        </view>
      </view>
<!--      处理录音-->
      <view class="processing-record" v-else-if="pageStatus === 1">
        <text>汇报音频正在处理...</text>
      </view>
<!--      处理完成  v-else-->
      <view class="processing-completed">
        <button @click="reportDisabled = !reportDisabled" style="width:100px">编辑</button>
<!--        <textarea :value="workReport" cols="30" rows="10" :disabled="reportDisabled"></textarea>-->
          <van-cell-group>
            <van-field
                value="输入框已禁用"
                left-icon="contact"
                :disabled="reportDisabled"
            />
          </van-cell-group>
      </view>
    </view>
  </template>

<script>
const recorderManager = uni.getRecorderManager() // 音频录制
const innerAudioContext = uni.createInnerAudioContext() //音频播放
var init // 录制时长计时器
var timer // 播放 录制倒计时
export default {
  data() {
    return {
      count: null, // 录制倒计时
      longPress: '0', // 1显示 按住说话 2显示 说话中
      delShow: false, // 删除提示框显示隐藏
      time: '00:00:00', //录音时长
      duration: 60000, //录音最大值ms 60000/1分钟
      tempFilePath: '', //音频路径
      playStatus: 0, //录音播放状态 0:未播放 1:正在播放

      hour:0,
      minute:0,
      second:0,
      animatedStyle:{
        animationPlayState:'running',
        color:'red'
      },

      pageStatus:0, //0:录制音频 1:正在处理中 2:已完成
      workReport:null,
      reportDisabled:true
    }
  },
  methods: {

    submit(){
      this.workReport = '测试数据report'
    },
    // 倒计时
    // countdown(val){
    //   let _then = this;
    //   _then.count = Number(val);
    //   timer = setInterval(function() {
    //     if(_then.count > 0){
    //       _then.count--
    //     } else {
    //       _then.longPress = '1';
    //       clearInterval(timer);
    //     }
    //   }, 1000);
    // },
    // 长按开始录音
    longpressBtn(){
      this.longPress = '2';
      // this.countdown(60); // 倒计时
      clearInterval(init) // 清除定时器
      this.initTime()
      // 监听录音停止事件，1.会回调文件地址 2.清除定时器
      recorderManager.onStop((res) => {
        this.tempFilePath = res.tempFilePath;
        this.recordingTimer(this.time);
      })
      const options = {
        duration: this.duration, // 指定录音的时长，单位 ms
        sampleRate: 16000, // 采样率
        numberOfChannels: 1, // 录音通道数
        encodeBitRate: 96000, // 编码码率
        format: 'mp3', // 音频格式，有效值 aac/mp3
        frameSize: 10, // 指定帧大小，单位 KB
      }
      this.recordingTimer();//开始录音，记录秒数
      recorderManager.start(options);
      // 监听音频开始事件
      recorderManager.onStart((res) => {
        console.log(res)
      })
    },
    // 长按松开录音事件，1，停止录音并修改longPress为1 2，获取录音文件地址 清除定时器
    touchendBtn(){
      this.longPress = '1';
      recorderManager.onStop((res) => {
        this.tempFilePath = res.tempFilePath
      })
      this.recordingTimer(this.time)
      recorderManager.stop()
      // this.initTime()
    },
    initTime(){
      this.time = '00:00:00'
      this.hour=0
      this.minute=0
      this.second=0
    },
    recordingTimer(time){
      var that = this;
      if (time == undefined) {
        // 将计时器赋值给init
        init = setInterval(function() {
          that.second += 1;
          if (that.second >= 60) {
            that.minute += 1;
            that.second = 0;
          }
          if (that.minute >= 60) {
            that.minute = 0; // minute归零，小时加一
            that.hour += 1;
          }
          // 确保hour, minute, second都是字符串类型再调用padStart
          that.time = (that.hour.toString().padStart(2, '0') + ':' +
              that.minute.toString().padStart(2, '0') + ':' +
              that.second.toString().padStart(2, '0'));
        }, 1000);
      } else {
        clearInterval(init)
      }
    },
    // 删除录音
    delBtn(){
      this.delShow = false;
      this.time = 0
      this.tempFilePath = ''
      this.playStatus = 0
      innerAudioContext.stop()
    },
    // 已经录过音频，点击开始播放
    playBtn(){
      innerAudioContext.src = this.tempFilePath
      //在ios下静音时播放没有声音，默认为true，改为false就好了。
      // innerAudioContext.obeyMuteSwitch = false
      //点击播放 playStatus 0未播放；1正在播放
      if (this.playStatus == 0) {
        this.playStatus = 1;
        innerAudioContext.play();
        // this.countdown(this.time); // 倒计时
      } else {
        this.playStatus = 0;
        innerAudioContext.pause()
      }
      // //播放结束
      innerAudioContext.onEnded(() => {
        this.playStatus = 0;
        innerAudioContext.stop();
      })
    },
  }
}
</script>


<style>
//工作报告
.processing-completed{

}
/* 语音录制开始--------------------------------------------------------------------- */
.record-layer{
  width: 100%;
  padding: 100px 0;
  box-sizing: border-box;
}
.record-box{
  width: 100%;
  position: relative;
}
.record-btn-layer{
  width: 100%;
}
.record-btn-layer button::after {
  border: none;
}
.record-btn-layer button{
  font-size: 14px;
  line-height: 38px;
  width: 100%;
  height: 38px;
  border-radius: 8px;
  text-align: center;
  background: #FFD300;
}
.record-btn-layer button image{
  width: 16px;
  height: 16px;
  margin-right: 4px;
  vertical-align: middle;
}
.record-btn-layer .record-btn-2{
  background: rgba(255, 211, 0, 0.2);
}
/* 提示小弹窗 */
.prompt-layer{
  border-radius: 8px;
  background: #FFD300;
  padding: 8px 16px;
  box-sizing: border-box;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.prompt-layer::after{
  content: '';
  display: block;
  border: 6px solid rgba(0,0,0,0);
  //border-top-color: rgba(255, 211, 0, 1);
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
}
.prompt-layer-1{
  font-size: 12px;
  width: 128px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  top: -140px;
}
.prompt-layer-1 .p{
  color: #000000;
}
.prompt-layer-1 .span{
  color: rgba(0,0,0,.6);
}
.prompt-loader .em{

}
/* 语音音阶------------- */
.prompt-loader {
  width: 96px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.pause-animation{
  animation-play-state:paused !important;
  color:red!important;
}
.prompt-loader .em {
  display: block;
  background: #333333;
  width: 1px;
  height: 10%;
  margin-right: 2.5px;
  float: left;
}
.prompt-loader .em:last-child {
  margin-right: 0px;
}
.prompt-loader .em:nth-child(1) {
  //持续2.5s 延迟1.4s后执行 无限次播放 匀速
  animation: load 2.5s 1.4s infinite linear;
}
.prompt-loader .em:nth-child(2) {
  animation: load 2.5s 1.2s infinite linear;
}
.prompt-loader .em:nth-child(3) {
  animation: load 2.5s 1s infinite linear;
}
.prompt-loader .em:nth-child(4) {
  animation: load 2.5s 0.8s infinite linear;
}
.prompt-loader .em:nth-child(5) {
  animation: load 2.5s 0.6s infinite linear;
}
.prompt-loader .em:nth-child(6) {
  animation: load 2.5s 0.4s infinite linear;
}
.prompt-loader .em:nth-child(7) {
  animation: load 2.5s 0.2s infinite linear;
}
.prompt-loader .em:nth-child(8) {
  animation: load 2.5s 0s infinite linear;
}
.prompt-loader .em:nth-child(9) {
  animation: load 2.5s 0.2s infinite linear;
}
.prompt-loader .em:nth-child(10) {
  animation: load 2.5s 0.4s infinite linear;
}
.prompt-loader .em:nth-child(11) {
  animation: load 2.5s 0.6s infinite linear;
}
.prompt-loader .em:nth-child(12) {
  animation: load 2.5s 0.8s infinite linear;
}
.prompt-loader .em:nth-child(13) {
  animation: load 2.5s 1s infinite linear;
}
.prompt-loader .em:nth-child(14) {
  animation: load 2.5s 1.2s infinite linear;
}
.prompt-loader .em:nth-child(15) {
  animation: load 2.5s 1.4s infinite linear;
}
@keyframes load {
  0% {
    height: 10%;
  }
  50% {
    height: 100%;
  }
  100% {
    height: 10%;
  }
}
/* 语音音阶-------------------- */
.prompt-layer-2{
  top: -40px;
}
.prompt-layer-2 .text{
  color: rgba(0, 0, 0, 1);
  font-size: 12px;
}
/* 语音录制结束---------------------------------------------------------------- */
</style>

