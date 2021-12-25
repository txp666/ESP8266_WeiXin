import mqtt from '../../utils/mqtt.js';

const aliyunOpt = require('../../utils/aliyun/aliyun_connect.js')

let that = null;
Page({
    data: {
      
       

        client: null,
        //记录重连的次数
        reconnectCounts: 0,
        //MQTT连接的配置
        options: {
            protocolVersion: 4, //MQTT连接协议版本
            clean: false,
            reconnectPeriod: 1000, //1000毫秒，两次重新连接之间的间隔
            connectTimeout: 30 * 1000, //1000毫秒，两次重新连接之间的间隔
            resubscribe: true, //如果连接断开并重新连接，则会再次自动订阅已订阅的主题（默认true）
            clientId: '',
            password: '',
            username: '',
        },
        aliyunInfo: {
          productKey: 'a1T****Ujdz', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
          deviceName: 'weixin', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
          deviceSecret: 'e8*****c6xftaJ11bqi5mO2pR', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
            regionId: 'cn-shanghai', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
          pubTopic: '/a1TQXyxUjdz/weixin/user/update', //发布消息的主题
          subTopic: '/a1TQXyxUjdz/weixin/user/get', //订阅消息的主题
        },
    },
    onLoad: function ()  {
        that = this;
        
        //连接服务器
        //传进去三元组等信息，拿到mqtt连接的各个参数
        let clientOpt = aliyunOpt.getAliyunIotMqttClient({
            productKey: that.data.aliyunInfo.productKey,
            deviceName: that.data.aliyunInfo.deviceName,
            deviceSecret: that.data.aliyunInfo.deviceSecret,
            regionId: that.data.aliyunInfo.regionId,
            port: that.data.aliyunInfo.port,
        });
        //console.log("get data:" + JSON.stringify(clientOpt));
        //得到连接域名
        let host = 'wxs://' + clientOpt.host;
        this.setData({
            'options.clientId': clientOpt.clientId,
            'options.password': clientOpt.password,
            'options.username': clientOpt.username,
        })
        console.log("this.data.options host:" + host);
        console.log("this.data.options data:" + JSON.stringify(this.data.options));
        //开始连接
        this.data.client = mqtt.connect(host, this.data.options);
        this.data.client.on('connect', function (connack) {
            wx.showToast({
                title: '连接成功'
            })
        })
        //服务器下发消息的回调
        that.data.client.on("message", function (topic, payload) {
            console.log(" 收到 topic:" + topic + " , payload :" + payload)
            wx.showModal({
                content: " 收到topic:[" + topic + "], payload :[" + payload + "]",
                showCancel: false,
            });
        })
        //服务器连接异常的回调
        that.data.client.on("error", function (error) {
            console.log(" 服务器 error 的回调" + error)

        })
        //服务器重连连接异常的回调
        that.data.client.on("reconnect", function () {
            console.log(" 服务器 reconnect的回调")

        })
        //服务器连接异常的回调
        that.data.client.on("offline", function (errr) {
            console.log(" 服务器offline的回调")
        })
    }, //选择改色时触发（在左侧色盘触摸或者切换右侧色相条）
  
    onClickOpen() {
      that.sendCommond('set', 1);
    },
    onClickOff() {
      that.sendCommond('set', 2);
    },
    sendCommond(cmd, data) {
        let sendData = {
            cmd: cmd,
            data: data,
        };
        if (this.data.client && this.data.client.connected) {
            this.data.client.publish(this.data.aliyunInfo.pubTopic, JSON.stringify(sendData));
            
        } else {
            wx.showToast({
                title: '请先连接服务器',
                icon: 'none',
                duration: 2000
            })
        }
    }

})
