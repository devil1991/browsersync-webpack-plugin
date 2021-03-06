'use strict';

var _createClass = (function() {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ('value' in descriptor) descriptor.writable = true;
			Object.defineProperty(
				target,
				descriptor.key,
				descriptor
			);
		}
	}
	return function(Constructor, protoProps, staticProps) {
		if (protoProps)
			defineProperties(Constructor.prototype, protoProps);
		if (staticProps) defineProperties(Constructor, staticProps);
		return Constructor;
	};
})();

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError('Cannot call a class as a function');
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError(
			"this hasn't been initialised - super() hasn't been called"
		);
	}
	return call && (typeof call === 'object' || typeof call === 'function')
		? call
		: self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== 'function' && superClass !== null) {
		throw new TypeError(
			'Super expression must either be null or a function, not ' +
				typeof superClass
		);
	}
	subClass.prototype = Object.create(superClass && superClass.prototype, {
		constructor: {
			value: subClass,
			enumerable: false,
			writable: true,
			configurable: true,
		},
	});
	if (superClass)
		Object.setPrototypeOf
			? Object.setPrototypeOf(subClass, superClass)
			: (subClass.__proto__ = superClass);
}

(function() {
	var __modules = {},
		__modulesCache = {},
		__moduleIsCached = {};

	function __require(uid, parentUid) {
		if (!__moduleIsCached[uid]) {
			__modulesCache[uid] = { exports: {}, loaded: false };
			__moduleIsCached[uid] = true;
			if (uid === 0 && typeof require === 'function') {
				require.main = __modulesCache[0];
			} else {
				__modulesCache[uid].parent =
					__modulesCache[parentUid];
			}

			__modules[uid].call(
				this,
				__modulesCache[uid],
				__modulesCache[uid].exports
			);
			__modulesCache[uid].loaded = true;
		}
		return __modulesCache[uid].exports;
	}

	function __getFilename(path) {
		return require('path').resolve(__dirname + '/' + path);
	}

	function __getDirname(path) {
		return require('path').resolve(__dirname + '/' + path + '/../');
	}

	__modules[0] = function(module, exports) {
		var EventEmitter = require('events');
		var url = require('url');
		var debuglog = require('util').debuglog(
			'BrowserSyncWebpackPlugin'
		);

		var browserSync = require('browser-sync');
		var merge = require('webpack-merge');

		var _require = __require(1, 0),
			desire = _require.desire,
			uniq = _require.uniq;

		var htmlInjector = desire('bs-html-injector');
		var webpackDevMiddleware = desire('webpack-dev-middleware');
		var webpackHotMiddleware = desire('webpack-hot-middleware');

		module.exports = (function(_EventEmitter) {
			_inherits(BrowserSyncWebpackPlugin, _EventEmitter);

			function BrowserSyncWebpackPlugin(options) {
				var watcher =
					arguments.length > 1 &&
					arguments[1] !== undefined
						? arguments[1]
						: browserSync.create();

				_classCallCheck(this, BrowserSyncWebpackPlugin);

				var _this = _possibleConstructorReturn(
					this,
					(BrowserSyncWebpackPlugin.__proto__ ||
						Object.getPrototypeOf(
							BrowserSyncWebpackPlugin
						))
						.call(this)
				);

				_this.open = true;
				_this.compiler = null;
				_this.middleware = [];
				_this.ready = false;
				_this.resolvers = [];
				_this.watcher = watcher;
				_this.watcherConfig = {};
				_this.options = merge(
					{
						proxyUrl:
							'https://localhost:3000',
						watch: [],
						sync: true,
						delay: 50,
						debounce: 0,
						events: {
							setup() {},
							ready() {},
							update() {},
							add() {},
							change() {},
							unlink() {},
						},
						advanced: {
							browserSync: {},
							webpackDevMiddleware: {},
							webpackHotMiddleware: {},
							injectorRequestOptions: {},
						},
					},
					options
				);
				return _this;
			}

			_createClass(BrowserSyncWebpackPlugin, [
				{
					key: 'registerEvents',
					value: function registerEvents() {
						var _this2 = this;

						Object.keys(
							this.options.events
						).forEach(function(event) {
							_this2.on(
								event,
								debuglog.bind(
									debuglog,
									`Event: ${event}`
								)
							);
							_this2.on(
								event,
								_this2.options
									.events[
									event
								]
							);
						});
						this.on(
							'webpack.compilation',
							function() {
								return _this2.watcher.notify(
									'Rebuilding...'
								);
							}
						);
						this.once(
							'webpack.done',
							this.start.bind(this)
						);
						this.on('ready', function() {
							_this2.ready = true;
						});
					},
				},
				{
					key: 'apply',
					value: function apply(compiler) {
						if (this.options.disable) {
							return;
						}
						this.registerEvents();
						this.compiler = compiler;
						compiler.plugin(
							'done',
							this.emit.bind(
								this,
								'webpack.done',
								this
							)
						);
						compiler.plugin(
							'compilation',
							this.emit.bind(
								this,
								'webpack.compilation',
								this
							)
						);
					},
				},
				{
					key: 'start',
					value: function start() {
						var _this3 = this;

						this.setup();
						this.watcher.emitter.on(
							'init',
							this.emit.bind(
								this,
								'ready',
								this,
								this.watcher
							)
						);
						this.watcher.emitter.on(
							'file:changed',
							function(
								event,
								file,
								stats
							) {
								_this3.emit(
									'update',
									_this3,
									file,
									stats,
									event
								);
								_this3.emit(
									event,
									_this3,
									file,
									stats
								);
							}
						);
						this.watcher.init(
							this.watcherConfig
						);
					},
				},
				{
					key: 'setup',
					value: function setup() {
						if (
							this.useHtmlInjector() &&
							this.options.watch
						) {
							this.watcher.use(
								htmlInjector,
								{
									files: Array.isArray(
										this
											.options
											.watch
									)
										? uniq(
												this
													.options
													.watch
											)
										: [
												this
													.options
													.watch,
											],

									requestOptions: Object.assign(
										{
											agentOptions: {
												rejectUnauthorized: false,
											},
										},
										this
											.options
											.advanced
											.injectorRequestOptions
									),
								}
							);
						}
						if (webpackDevMiddleware) {
							this.setupWebpackDevMiddleware();
						}
						if (webpackHotMiddleware) {
							this.setupWebpackHotMiddleware();
						}
						this.config();
						this.checkProtocols(
							this.options.proxyUrl,
							this.options.target
						);
						this.emit(
							'setup',
							this,
							this.watcherConfig
						);
					},
				},
				{
					key: 'setupWebpackDevMiddleware',
					value: function setupWebpackDevMiddleware() {
						this.webpackDevMiddleware = webpackDevMiddleware(
							this.compiler,
							merge(
								{
									publicPath:
										this
											.options
											.publicPath ||
										this
											.compiler
											.options
											.output
											.publicPath,
									stats: false,
									noInfo: true,
								},
								this.compiler
									.options
									.devServer,
								this.options
									.advanced
									.webpackDevMiddleware
							)
						);
						this.middleware.push(
							this
								.webpackDevMiddleware
						);
					},
				},
				{
					key: 'setupWebpackHotMiddleware',
					value: function setupWebpackHotMiddleware() {
						this.webpackHotMiddleware = webpackHotMiddleware(
							this.compiler,
							merge(
								{
									log: this.watcher.notify.bind(
										this
											.watcher
									),
								},
								this.options
									.advanced
									.webpackHotMiddleware
							)
						);
						this.middleware.push(
							this
								.webpackHotMiddleware
						);
					},
				},
				{
					key: 'config',
					value: function config() {
						var watchOptions = merge(
							{ ignoreInitial: true },
							this.getPollOptions()
						);
						var reloadDebounce =
							this.options.debounce ||
							watchOptions.aggregateTimeout ||
							0;
						this.watcherConfig = merge(
							{
								open: this
									.options
									.open,
								host: url.parse(
									this
										.options
										.proxyUrl
								).hostname,
								port: url.parse(
									this
										.options
										.proxyUrl
								).port,
								proxy: {
									target: this
										.options
										.target,
									middleware: this
										.middleware,
								},
								snippetOptions: {
									rule: {
										match: /<\/head>/i,
										fn: function fn(
											snippet,
											match
										) {
											return (
												snippet +
												match
											);
										},
									},
								},
								files:
									!this.useHtmlInjector() &&
									this
										.options
										.watch
										? Array.isArray(
												this
													.options
													.watch
											)
											? uniq(
													this
														.options
														.watch
												)
											: [
													this
														.options
														.watch,
												]
										: [],
								reloadDebounce,
								watchOptions,
							},
							this.options.advanced
								.browserSync
						);
					},
				},
				{
					key: 'getPollOptions',
					value: function getPollOptions() {
						var watchOptions = this.getWatchOptions();
						var polling =
							watchOptions.poll ||
							false;
						var usePolling = Boolean(
							polling
						);
						var interval =
							polling === usePolling
								? 100
								: polling;
						return {
							interval,
							usePolling,
							binaryInterval: Math.min(
								interval * 3,
								interval + 200
							),
						};
					},
				},
				{
					key: 'getWatchOptions',
					value: function getWatchOptions() {
						var options = this.compiler
							.options;
						var webpackWatchOptions =
							options.watchOptions ||
							{};
						var devServerWatchOptions =
							(options.devServer
								? options
										.devServer
										.watchOptions
								: {}) || {};
						return merge(
							webpackWatchOptions,
							devServerWatchOptions
						);
					},
				},
				{
					key: 'useHtmlInjector',
					value: function useHtmlInjector() {
						return (
							htmlInjector !==
							undefined
						);
					},
				},
				{
					key: 'checkProtocols',
					value: function checkProtocols(
						proxyUrl,
						targetUrl
					) {
						if (!(proxyUrl && targetUrl)) {
							return;
						}
						var proxyUrlProtocol = url
							.parse(proxyUrl)
							.protocol.slice(0, -1);
						var targetUrlProtocol = url
							.parse(targetUrl)
							.protocol.slice(0, -1);
						if (
							proxyUrlProtocol !==
							targetUrlProtocol
						) {
							console.warn(
								'Mismatched protocols. Things might not work right.'
							);
							console.warn(
								`Your proxy uses the protocol: ${proxyUrlProtocol}`
							);
							console.warn(
								`Your target uses the protocol: ${targetUrlProtocol}`
							);
						}
					},
				},
			]);

			return BrowserSyncWebpackPlugin;
		})(EventEmitter);

		return module.exports;
	};

	__modules[1] = function(module, exports) {
		module.exports.uniq = function(userArray) {
			return Array.from(new Set(userArray));
		};

		module.exports.desire = function(dependency, fallback) {
			try {
				require.resolve(dependency);
			} catch (err) {
				return fallback;
			}
			return require(dependency);
		};

		return module.exports;
	};

	if (typeof module === 'object') module.exports = __require(0);
	else return __require(0);
})();
