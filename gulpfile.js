"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gulp = __importStar(require("gulp"));
const gulp_minify_1 = __importDefault(require("gulp-minify"));
function publicJavascriptsMinFn() {
    return gulp.src("public/javascripts/!(*.min).js", { allowEmpty: true })
        .pipe(gulp_minify_1.default({ noSource: true, ext: { min: ".min.js" } }))
        .pipe(gulp.dest('public/javascripts'));
}
gulp.task("public-javascript-min", publicJavascriptsMinFn);
function watchFn() {
    gulp.watch("public/javascripts/!(*.min).js", publicJavascriptsMinFn);
}
gulp.task("watch", watchFn);
gulp.task("default", function () {
    publicJavascriptsMinFn();
    watchFn();
});
