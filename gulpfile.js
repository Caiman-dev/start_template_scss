const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const include = require('gulp-include');

function styles() {
	return src([
		'node_modules/normalize.css/normalize.css',
		'app/scss/style.scss'
	])
		.pipe(autoprefixer({ overrideBrowserlist: ['last 10 version'] }))
		.pipe(concat('style.min.css'))
		.pipe(scss({ outputStyle: 'compressed' }))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
}

function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.js',
		'app/js/main.js'
	])
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(dest('app/js'))
		.pipe(browserSync.stream())
}

function images() {
	return src(['app/images/src/*.*', '!app/images/src/*.svg'])
		.pipe(newer('app/images'))
		.pipe(avif({ quality: 50 }))

		.pipe(src('app/images/src/*.*'))
		.pipe(newer('app/images'))
		.pipe(webp())

		.pipe(src('app/images/src/*.*'))
		.pipe(newer('app/images'))
		.pipe(imagemin())

		.pipe(dest('app/images'))
}

function sprite() {
	return src('app/images/*.svg')
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../sprite.svg',
					example: true
				}
			}
		}))
		.pipe(dest('app/images'))
}

function fonts() {
	return src('app/fonts/src/*.*')
		.pipe(fonter({
			formats: ['woff2', 'ttf']
		}))
		.pipe(src('app/fonts/*.ttf'))
		.pipe(ttf2woff2())
		.pipe(dest('app/fonts'))
}

function pages() {
	return src('app/pages/*.html')
		.pipe(include({
			includePaths: 'app/components'
		}))
		.pipe(dest('app'))
		.pipe(browserSync.stream())
}

function cleanDist() {
	return src('dist', { allowEmpty: true })
		.pipe(clean())
}

function buildProject() {
	return src([
		'app/css/style.min.css',
		'app/js/main.min.js',
		'app/images/*.*',
		// '!app/images/*.svg',
		// 'app/images/sprite.svg',
		'app/fonts/*.*',
		// 'app/**/*.html'
		'app/*.html'
	], { base: 'app' })
		.pipe(dest('dist'))
}

function watching() {
	browserSync.init({
		server: {
			baseDir: "app/"
		}
	});
	watch(['app/scss/style.scss'], styles)
	watch(['app/js/main.js'], scripts)
	watch(['app/images/src'], images)
	watch(['app/fonts/src'], fonts)
	watch(['app/pages/*', 'app/components/*'], pages)
	watch(['app/*.html']).on('change', browserSync.reload)
}

exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.fonts = fonts;
exports.pages = pages;
exports.watching = watching;

exports.sprite = sprite;

exports.build = series(cleanDist, buildProject);
exports.default = parallel(styles, scripts, images, fonts, pages, watching);