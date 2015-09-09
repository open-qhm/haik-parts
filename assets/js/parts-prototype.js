$(function () {

  var opener = window.parent;
  var haikParts = {};
/*
  if (typeof haikParts.parts === "undefined") {
    if (typeof localStorage.haikParts === "undefined") {
*/
  var partsFile = "data/girls.parts.json";
  
  haikParts.parts = $.ajax({
    url: partsFile,
    async: false,
    dataType: "json"
  }).responseJSON;

  for (var i in haikParts.parts) {
    if (haikParts.parts[i].code.length == 0) {
      var id = 'haik_parts_code_' + haikParts.parts[i].name;
      $("#" + id).each(function(){
       haikParts.parts[i].code = $(this).text();
      });
    }

    if (typeof haikParts.parts[i].visible != 'undefined') {
      if ( ! haikParts.parts[i].visible) {
        haikParts.parts.splice(i, 1);
      }
    }
  }

/*
      localStorage.haikParts = JSON.stringify(haikParts.parts);
    }
    else {
      haikParts.parts = JSON.parse(localStorage.haikParts);
    }
  }
*/
  var vParts = new Vue({
    el: "#haik_parts_container",
    data: {
      categories: haikParts.parts,
      modal: true,
      activeFile: null,
      activeCode: null
    },
    methods: {
/*
      showDetail: function(cat){

        $(".haik-parts-categories").css({height: "auto"}).find(".haik-parts-box").css({opacity: 1});

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
*/
      insertCode: function(category){
        if (this.modal === false) {
          opener.postMessage({
            message: "sendCode",
            code: category.code
          }, "*");
        }
        else {
          $("#haik_parts_code_modal_"+category.name).appendTo("body");
        }
      }
    },
    partials: {
      "category-detail": "#haik_parts_category_detail_partial"
    }
  });

  if ( ! opener) {
    return;
  }

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
  
	
});