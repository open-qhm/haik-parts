(function ($) {

  var opener = window.parent,
      partsName = '';

  $.when(loadPartsData(), loadPartsSource());


  function loadPartsData() {
    var promise = $.Deferred();

    partsFile = "../data/prototype.parts.json";

    $.ajax({
      url: partsFile,
      dataType: "json"
    })
    .done(function(parts){
      for (var i in parts) {
        if (typeof parts[i].visible != 'undefined') {
          if ( ! parts[i].visible) {
            parts.splice(i, 1);
          }
        }
      }

      vParts.categories = parts;
      promise.resolve('');
    })
    .fail(function(err, error, message){
      alert("パーツデータが読み込めません：" + err.status + " " + message);
      promise.reject();
    });

    return promise;
  }


  function loadPartsSource() {
    var promise = $.Deferred();
    
    sourceFile = "../data/code/prototype.code.html";

    $.ajax({
      url: sourceFile,
      dataType: "html"
    })
    .done(function(html){
      $("#code_container").html(html);
      promise.resolve('');
    })
    .fail(function(err, error, message){
      alert("パーツ詳細が読み込めません：" + err.status + " " + message);
      promise.reject();
    });
  }

  var vParts = new Vue({
    el: "#haik_parts_container",
    data: {
      categories: [],
      activeFile: null,
      activeCode: null,
      copied: false
    },
    methods: {
      insertCode: function(category){
        var $modal = $("#haik_parts_code_modal_" + category.name);
        var code = $("#haik_parts_code_"+category.name).text();
        
        vParts.copied = false;

        $modal
        .find("textarea").val(code).end()
        .appendTo("body");
        
        $modal.one("shown.bs.modal", function(){
          $("textarea", this).click();
        });

        var client = new ZeroClipboard($(".copy-button", $modal));
        client.on("ready", function(readyEvent ) {
          client.on("copy", function(event) {
            event.clipboardData.setData('text/plain', code);
          });
          client.on("aftercopy", function(event){
            vParts.copied = true;
          });
        });
      }
    },
    partials: {
      "category-detail": "#haik_parts_category_detail_partial"
    }
  });

  window.vParts = vParts;
	
})(jQuery);
