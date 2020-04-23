const ogTitle = document.title;

const setTitle = () => {
  if (document.title === ogTitle) {
    document.title = "Party 🎉 - " + document.title;
  }
};

var titleEl = document.getElementsByTagName("title")[0];
var docEl = document.documentElement;

if (docEl && docEl.addEventListener) {
  docEl.addEventListener(
    "DOMSubtreeModified",
    function (evt) {
      var t = evt.target;
      if (t === titleEl || (t.parentNode && t.parentNode === titleEl)) {
        setTitle();
      }
    },
    false
  );
} else {
  document.onpropertychange = function () {
    if (window.event.propertyName == "title") {
      setTitle();
    }
  };
}
