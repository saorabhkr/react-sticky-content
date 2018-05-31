'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _Object$getPrototypeOf = _interopDefault(require('babel-runtime/core-js/object/get-prototype-of'));
var _classCallCheck = _interopDefault(require('babel-runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('babel-runtime/helpers/createClass'));
var _possibleConstructorReturn = _interopDefault(require('babel-runtime/helpers/possibleConstructorReturn'));
var _inherits = _interopDefault(require('babel-runtime/helpers/inherits'));
var React = _interopDefault(require('react'));
var ResizeObserver = _interopDefault(require('resize-observer-polyfill'));

var getScrollParent = function getScrollParent(node) {
  var offsetParent = node;
  while (offsetParent = offsetParent.offsetParent) {
    var overflowYVal = getComputedStyle(offsetParent, null).getPropertyValue("overflow-y");
    if (overflowYVal === "auto" || overflowYVal === "scroll") return offsetParent;
  }
  return window;
};

var offsetTill = function offsetTill(node, target) {
  var current = node;
  var offset = 0;
  do {
    offset += current.offsetTop;
    current = current.offsetParent;
  } while (current && current !== target);
  return offset;
};

var stickyProp = null;
if (typeof CSS !== "undefined" && CSS.supports) {
  if (CSS.supports("position", "sticky")) stickyProp = "sticky";else if (CSS.supports("position", "-webkit-sticky")) stickyProp = "-webkit-sticky";
}

var StickyBox = function (_React$Component) {
  _inherits(StickyBox, _React$Component);

  function StickyBox() {
    _classCallCheck(this, StickyBox);

    return _possibleConstructorReturn(this, (StickyBox.__proto__ || _Object$getPrototypeOf(StickyBox)).apply(this, arguments));
  }

  _createClass(StickyBox, [{
    key: "registerContainerRef",
    value: function registerContainerRef(n) {
      if (!stickyProp) return;
      this.node = n;
      if (n) {
        this.scrollPane = getScrollParent(this.node);
        this.latestScrollY = this.scrollPane === window ? window.scrollY : this.scrollPane.scrollTop;
        this.scrollPane.addEventListener("scroll", this.handleScroll);
        this.scrollPane.addEventListener("mousewheel", this.handleScroll);
        if (this.scrollPane === window) {
          window.addEventListener("resize", this.updateViewport);
          this.updateViewport();
        } else {
          this.rosp = new ResizeObserver(this.updateScrollPane);
          this.rosp.observe(this.scrollPane);
          this.updateScrollPane();
        }
        this.ropn = new ResizeObserver(this.updateParentNode);
        this.ropn.observe(this.node.parentNode);
        this.updateParentNode();

        this.ron = new ResizeObserver(this.updateNode);
        this.ron.observe(this.node);
        this.updateNode();

        this.initial();
      } else {
        this.scrollPane.removeEventListener("mousewheel", this.handleScroll);
        this.scrollPane.removeEventListener("scroll", this.handleScroll);
        if (this.scrollPane === window) {
          window.removeEventListener("resize", this.getMeasurements);
        } else {
          this.rosp.disconnect();
        }
        this.ropn.disconnect();
        this.ron.disconnect();
        this.scrollPane = null;
      }
    }
  }, {
    key: "initial",
    value: function initial() {
      var _props = this.props,
          bottom = _props.bottom,
          style = _props.style;

      if (bottom) {
        if (this.mode !== "stickyBottom") {
          this.mode = "stickyBottom";
          this.node.style.position = stickyProp;
          this.node.style.top = this.viewPortHeight - this.nodeHeight + "px";
        }
      } else {
        if (this.mode !== "stickyTop") {
          this.mode = "stickyTop";
          this.node.style.position = stickyProp;
          //if top is passed in component, it will apply else it will work as before.
          this.node.style.top = !style ? 0 : style.top;
        }
      }
    }
  }, {
    key: "updateViewport",
    value: function updateViewport() {
      this.viewPortHeight = window.innerHeight;
      this.scrollPaneOffset = 0;
    }
  }, {
    key: "updateScrollPane",
    value: function updateScrollPane() {
      this.viewPortHeight = this.scrollPane.offsetHeight;
      this.scrollPaneOffset = this.scrollPane.getBoundingClientRect().top;
    }
  }, {
    key: "updateParentNode",
    value: function updateParentNode() {
      var parentNode = this.node.parentNode;
      var computedParentStyle = getComputedStyle(parentNode, null);
      var parentPaddingTop = parseInt(computedParentStyle.getPropertyValue("padding-top"), 10);
      var parentPaddingBottom = parseInt(computedParentStyle.getPropertyValue("padding-bottom"), 10);
      var verticalParentPadding = parentPaddingTop + parentPaddingBottom;
      this.naturalTop = offsetTill(parentNode, this.scrollPane) + parentPaddingTop + this.scrollPaneOffset;
      this.parentHeight = parentNode.getBoundingClientRect().height - verticalParentPadding;
    }
  }, {
    key: "updateNode",
    value: function updateNode() {
      this.nodeHeight = this.node.getBoundingClientRect().height;
    }
  }, {
    key: "handleScroll",
    value: function handleScroll() {
      var scrollY = this.scrollPane === window ? window.scrollY : this.scrollPane.scrollTop;
      if (scrollY === this.latestScrollY) return;
      if (this.nodeHeight <= this.viewPortHeight) {
        // Just make it sticky if node smaller than viewport
        this.initial();
        return;
      }
      var scrollDelta = scrollY - this.latestScrollY;
      if (scrollDelta > 0) {
        // scroll down
        if (this.mode === "stickyTop") {
          if (scrollY + this.scrollPaneOffset > this.naturalTop) {
            this.mode = "relative";
            this.node.style.position = "relative";
            this.offset = Math.max(0, this.scrollPaneOffset + this.latestScrollY - this.naturalTop);
            this.node.style.top = this.offset + "px";
          }
        } else if (this.mode === "relative") {
          if (scrollY + this.scrollPaneOffset + this.viewPortHeight > this.naturalTop + this.nodeHeight + this.offset) {
            this.mode = "stickyBottom";
            this.node.style.position = stickyProp;
            this.node.style.top = this.viewPortHeight - this.nodeHeight + "px";
          }
        }
      } else {
        // scroll up
        if (this.mode === "stickyBottom") {
          if (this.scrollPaneOffset + scrollY + this.viewPortHeight < this.naturalTop + this.parentHeight) {
            this.mode = "relative";
            this.node.style.position = "relative";
            this.offset = this.scrollPaneOffset + this.latestScrollY + this.viewPortHeight - (this.naturalTop + this.nodeHeight);
            this.node.style.top = this.offset + "px";
          }
        } else if (this.mode === "relative") {
          if (this.scrollPaneOffset + scrollY < this.naturalTop + this.offset) {
            this.mode = "stickyTop";
            this.node.style.position = stickyProp;
            this.node.style.top = 0;
          }
        }
      }

      this.latestScrollY = scrollY;
    }
  }, {
    key: "render",
    value: function render() {
      var _props2 = this.props,
          children = _props2.children,
          className = _props2.className,
          style = _props2.style;

      return React.createElement(
        "div",
        { className: className, style: style, ref: this.registerContainerRef },
        children
      );
    }
  }]);

  return StickyBox;
}(React.Component);

module.exports = StickyBox;
