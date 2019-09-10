// miniprogram/pages/index/camera/camera.js
var md5 = require('../../../utils/md5.js')
var http = require('../../../utils/http.js')
var util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    accessToken: "",
    isShow: false,
    results: [],
    src: "",
    isCamera: true,
    btnTxt: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.ctx = wx.createCameraContext()
    var time = wx.getStorageSync("time")
    var curTime = new Date().getTime()
    var timeNum = new Date(parseInt(curTime - time) * 1000).getDay()
    console.log("=======" + timeNum)
    var accessToken = wx.getStorageSync("access_token")
    console.log("====accessToken===" + accessToken + "a")
    if (timeNum > 28 || (accessToken == "" ||
        accessToken == null || accessToken == undefined)) {
      this.accessTokenFunc()
    } else {
      this.setData({
        accessToken: wx.getStorageSync("access_token")
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  takePhoto() {
    var that = this
    if (this.data.isCamera == false) {
      this.setData({
        isCamera: true,
        btnTxt: ""
      })
      return
    }
    this.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath,
          isCamera: false,
          btnTxt: "重拍"
        })
        wx.showLoading({
          title: '正在加载中',
        })
        wx.getFileSystemManager().readFile({
          filePath: res.tempImagePath,
          encoding: "base64",
          success: res => {
            that.req(that.data.accessToken, res.data)
          },
          fail: res => {
            wx.hideLoading()
            wx.showToast({
              title: '拍照失败,未获取相机权限或其他原因',
              icon: "none"
            })
          }
        })
      }
    })

  },
  accessTokenFunc: function() {
    var that = this
    console.log("accessTokenFunc is start")
    wx.cloud.callFunction({
      name: 'baiduAccessToken',
      success: res => {
        console.log("====" + JSON.stringify(res))
        console.log("====" + JSON.stringify(res.result.data.access_token))
        that.data.accessToken = res.result.data.access_token
        wx.setStorageSync("access_token", res.result.data.access_token)
        wx.setStorageSync("time", new Date().getTime())
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '调用失败',
        })
        console.error('[云函数] [sum] 调用失败：', err)
      }
    })
  },
  req: function (token, image) {
    var that = this
    http.req("https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general?access_token=" + token, {
      "image": image
    }, function (res) {
      wx.hideLoading()
      if (JSON.stringify(res)=='false'){
        wx.showToast({
          icon: 'none',
          title: '网络连接失败',
        })
        return
      }
      console.log(JSON.stringify(res))
      var num = res.result_num
      var results = res.data.result
      if (results != undefined && results != null) {
        that.setData({
          isShow: true,
          results: results
        })

        console.log(results)
      } else {
        wx.showToast({
          icon: 'none',
          title: 'AI识别失败,请联系管理员',
        })
      }
    }, "POST")
  },
  radioChange: function (e) {
    console.log(e)
    console.log(e.detail)
    console.log(e.detail.value)
    wx.showToast({
      icon: 'none',
      title: '界面开发中',
    })
    // wx.navigateTo({
    //   url: '/pages/result/list?keyword=' + e.detail.value,
    // })
  },  
  hideModal: function () {
    this.setData({
      isShow: false,
    })
  },
  error(e) {
    console.log(e.detail)
  }
})