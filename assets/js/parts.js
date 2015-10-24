(function ($) {

  var opener = window.parent,
      partsName = '';

  var exPaletteThemes = {
    "haik_doc"    : null,
    "haik_fabric" : null,
    "haik_kinaco" : null,
    "haik_pop"    : null,
    "haik_tent"   : null
  };

  if (location.hash.length > 1) {
    onHashChange();
  } else {
    loadParts()
  }

  $(window).on("hashchange", onHashChange);

  function onHashChange() {
    partsName = location.hash.substr(1);
    loadParts(partsName, function(){
      loadParts();
    });
  }

  function loadParts(partsName, cb) {
    var promise = $.when(
      loadPartsData(partsName),
      loadPartsSource(partsName)
    );
    if (cb) {
      promise.fail(cb);
    }
  }

  function loadPartsData(partsName) {
    var promise = $.Deferred();
    if (partsName) {
      partsFile = "data/palette.parts.json";
      if (partsName in exPaletteThemes) {
        partsFile = "data/" + partsName + ".parts.json";
      }
    } else {
      partsFile = "data/parts.json";
    }

    $.ajax({
      url: partsFile,
      dataType: "json"
    })
    .done(function(parts){
      for (var i in parts) {
        for (var j in parts[i].items) {
          if (typeof parts[i].items[j].visible != 'undefined') {
            if ( ! parts[i].items[j].visible) {
              parts[i].items.splice(j, 1);
            }
          }
        }
      }
      vParts.categories = parts;
      promise.resolve(partsName);
    })
    .fail(function(err, error, message){
      promise.reject("パーツデータが読み込めません：" + err.status + " " + message);
    });

    return promise;

  }

  function loadPartsSource(partsName) {
    var promise = $.Deferred();
    if (partsName) {
      sourceFile = "data/code/palette.code.html";
      if (partsName in exPaletteThemes) {
        sourceFile = "data/code/" + partsName + ".code.html";
      }
    } else {
      sourceFile = "data/code/code.html";
    }

    $.ajax({
      url: sourceFile,
      dataType: "html"
    })
    .done(function(html){
      var partsHtml = '';
      var parts = vParts.categories;
      for (var i in parts) {
        for (var j in parts[i].items) {
          if (typeof parts[i].items[j].code != '') {
            partsHtml += '<script type="text/x-haik-code" id="haik_parts_code_'+parts[i].name + '_' + parts[i].items[j].name+'">' + parts[i].items[j].code + '</script>';
          }
        }
      }
      $("#code_container").html(html + partsHtml);
      promise.resolve(partsName);
    })
    .fail(function(err, error, message){
      promise.reject("パーツ詳細が読み込めません：" + err.status + " " + message);
    });
  }

  var vParts = new Vue({
    el: "#haik_parts_container",
    data: {
      categories: [],
      modal:      true,
      activeFile: null,
      activeCode: null
    },
    methods: {
      showDetail: function(cat){

        $(".haik-parts-categories")
        .css({height: "auto"})
          .find(".haik-parts-box").css({opacity: 1});

        if (this.activeFile) {
          this.activeFile.showDetail = false;
        }

        if (this.activeFile === cat) {
          this.activeFile = null;
          return;
        }
        cat.showDetail = true;
        this.activeFile = cat;

        setTimeout(function(){
          var $parent = $("[data-category="+cat.name+"]");
          var detailHeight = $("[data-parent="+cat.name+"]").height();

          $parent.height($parent.height()+detailHeight+40);
          $parent.siblings().find(".haik-parts-box").css({opacity: ".2"});
          if (cat.name == 'icon') {
            $("[data-toggle=tooltip]").tooltip();
          }

          var p = $parent.offset().top;
          $('html,body').animate({ scrollTop: p }, 500);

        }, 300);
      },
      insertCode: function(item, category){
        if (this.modal === false) {
          opener.postMessage({
            message: "sendCode",
            code: $("#haik_parts_code_"+category.name+"_"+item.name).text()
          }, "*");
        }
        else {
          var code = $("#haik_parts_code_"+category.name+"_"+item.name).text();
          $("#haik_parts_code_modal_"+category.name+"_"+item.name)
            .find("textarea").val(code).end()
          .appendTo("body");
        }
      }
    },
    partials: {
      "category-detail": "#haik_parts_category_detail_partial"
    }
  });

  window.vParts = vParts;

  if (opener) {
    var messageListner = function(ev) {
      if (ev.data.message === "openerIsEditable") {
        vParts.$data.modal = false;
        $("header").hide();
      }
      else if (ev.data.message === "insertedText") {
        if (window.parent !== window) {
          window.close();
        }
      }
    };

    window.addEventListener("message", messageListner);
    opener.postMessage({
      message: "isOpenerEditable"
    }, "*");
  }

})(jQuery);
