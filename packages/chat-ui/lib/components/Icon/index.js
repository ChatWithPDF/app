"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Icon = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _react = _interopRequireDefault(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _excluded = ["type", "className", "spin", "name"];
var Icon = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var type = props.type,
    className = props.className,
    spin = props.spin,
    name = props.name,
    other = (0, _objectWithoutProperties2.default)(props, _excluded);
  var ariaProps = typeof name === 'string' ? {
    'aria-label': name
  } : {
    'aria-hidden': true
  };
  if (type === 'chevron-right') {
    return /*#__PURE__*/_react.default.createElement("svg", {
      fill: "#000",
      height: "18px",
      width: "18px",
      version: "1.1",
      id: "XMLID_287_",
      xmlns: "http://www.w3.org/2000/svg",
      xmlnsXlink: "http://www.w3.org/1999/xlink",
      viewBox: "0 0 24 24",
      xmlSpace: "preserve"
    }, /*#__PURE__*/_react.default.createElement("g", {
      id: "next"
    }, /*#__PURE__*/_react.default.createElement("g", null, /*#__PURE__*/_react.default.createElement("polygon", {
      points: "6.8,23.7 5.4,22.3 15.7,12 5.4,1.7 6.8,0.3 18.5,12 \t\t"
    }))));
  } else if (type === 'chevron-left') {
    return /*#__PURE__*/_react.default.createElement("svg", {
      fill: "#000",
      height: "18px",
      width: "18px",
      version: "1.1",
      id: "XMLID_54_",
      xmlns: "http://www.w3.org/2000/svg",
      xmlnsXlink: "http://www.w3.org/1999/xlink",
      viewBox: "0 0 24 24",
      xmlSpace: "preserve"
    }, /*#__PURE__*/_react.default.createElement("g", {
      id: "previous"
    }, /*#__PURE__*/_react.default.createElement("g", null, /*#__PURE__*/_react.default.createElement("polygon", {
      points: "17.2,23.7 5.4,12 17.2,0.3 18.5,1.7 8.4,12 18.5,22.3 \t\t"
    }))));
  }
  return /*#__PURE__*/_react.default.createElement("svg", (0, _extends2.default)({
    className: (0, _clsx.default)('Icon', {
      'is-spin': spin
    }, "#svg-icon-".concat(type)),
    ref: ref
  }, ariaProps, other), /*#__PURE__*/_react.default.createElement("use", {
    xlinkHref: "#icon-".concat(type)
  }));
});
exports.Icon = Icon;