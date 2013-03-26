// List Element Model
function ListModel($list) {
  this.$list = $list;
};
ListModel.prototype.add = function (values) {
  var that = this;
  
  if (! (values instanceof Array))
    var values = [].slice.call(arguments);
  
  values.forEach(function (str) {
    if (typeof str !== "string")
      throw new TypeError("str must be string");
    
    var $item = $("<li>").text(str);
    that.$list.append($item);
  });
};
ListModel.prototype.remove = function (index) {
  this.$list.children().eq(index).remove();
};
ListModel.prototype.edit = function (index, value) {
  value = document.createTextNode(value);
  this.$list.children().eq(index).html(value);
};

$(function () {
  "use strict";
  
  /* Setting */
  var clientId = "your client ID";
  
  var $list = $("#list"),
      $text = $("#textbox"),
      $send = $("#send"),
      $share = $("#share"),
      $create = $("#create");
  
  if (location.protocol === "file:")
    throw new Error("does not work on file URI scheme");
  else
    rtc();
  
  function rtc(title) {
    var realtimeLoader = new rtclient.RealtimeLoader({
      clientId: clientId,
      authButtonElementId: "authorizeButton",
      initializeModel: function (model) {
        var root = model.getRoot(),
            list = model.createList(["hello realtime chat!", "Tips: 共有ボタンから他の人をこのチャットルームへ招待することができます。"]);
        
        root.set("list", list);
      },
      autoCreate: false,
      defaultTitle: "Realtime Chat",
      onFileLoaded: function (doc) {
        var root = doc.getModel().getRoot(),
            list = root.get("list");
        
        // share button
        var appId = clientId.split("-")[0];
        var share = new gapi.drive.share.ShareClient(appId);
        share.setItemIds(rtclient.params.fileId);
        $share.click(function () {
          share.showSettingsDialog();
        });
        
        // send button
        $send.click(function () {
          var value = $text.val().trim();
          if (value.length > 0) {
            list.push(value);
            $text.val("");
          }
        });
        // Enter send
        $text.keydown(function (e) {
          if (e.keyCode === 13)
            $send.trigger("click");
        });
        
        var listModel = new ListModel($list);
        
        listModel.remove(0);
        listModel.add(list.asArray());
        list.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, function (e) {
          listModel.add(e.values);
        });
        
        $text.prop("disabled", false);
        $send.prop("disabled", false);
        $share.prop("disabled", false);
      }
    });
    realtimeLoader.start(function () {
      if (location.search === "") {
        $create.prop("disabled", false);
        $list.children().eq(0).text("作成ボタンから新しいチャットを開始できます。");
      } else
        $list.children().eq(0).text("メッセージの読込中...");
      
      $create.click(function () {
        realtimeLoader.createNewFileAndRedirect();
      });
    });
  }
});