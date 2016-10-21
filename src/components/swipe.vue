<style>
    @import '../styles/components/swipe.css';
</style>

<template>
    <div class="swipe">
        <div class="swipe-items-wrap" ref="wrap">
            <slot></slot>
        </div>
        <div class="swipe-indicators" v-if="showIndicators">
            <div class="swipe-indicator" v-for="page in pages" :class="{ active: page.index === index }"></div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import { once, addClass, removeClass } from 'wind-dom';
    import { eventHub } from '../libs/hub';

    export default {
        name: 'mt-swipe',

        created() {
            var _this = this;
            _this.dragState = {};

            ///////on event
            eventHub.$on("swipeItemCreated",_this.doHandleSwipeItemCreated);
            eventHub.$on("swipeItemDestroyed",_this.doHandleSwipeItemDestroyed);
        },

        data() {
            return {
                ready: false,
                dragging: false,
                userScrolling: false,
                animating: false,
                pages: [],
                timer: null,
                reInitTimer: null,
                noDrag: false,
                index : 0
            };
        },
        watch : {
            currIndex : function(val){
                this.index = val;
            }
        },
        props: {
            speed: {
                type: Number,
                default: 300
            },

            auto: {
                type: Number,
                default: 3000
            },

            continuous: {
                type: Boolean,
                default: true
            },

            currIndex: { /////从父组件获取的currIndex
              type: Number,
                default: 0
            },

            showIndicators: {
                type: Boolean,
                default: true
            },

            noDragWhenSingle: {
                type: Boolean,
                default: true
            },

            prevent: {
                type: Boolean,
                default: false
            }
        },

        methods: {
            doHandleSwipeItemCreated : function(){
                if (!this.ready) return;

                clearTimeout(this.reInitTimer);
                this.reInitTimer = setTimeout(() => {this.reInitPages() }, 100);
            },

            doHandleSwipeItemDestroyed : function(){
                if (!this.ready) return;

                clearTimeout(this.reInitTimer);
                this.reInitTimer = setTimeout(() => { this.reInitPages() }, 100);
            },

            translate(element, offset, speed, callback) {
                if (speed) {
                    this.animating = true;
                    element.style.webkitTransition = '-webkit-transform ' + speed + 'ms ease-in-out';
                    setTimeout(() => element.style.webkitTransform = `translate3d(${offset}px, 0, 0)`, 50);

                    var called = false;

                    var transitionEndCallback = () => {
                        if (called) return;
                        called = true;
                        this.animating = false;
                        element.style.webkitTransition = '';
                        element.style.webkitTransform = '';
                        if (callback) {
                            callback.apply(this, arguments);
                        }
                    };

                    once(element, 'webkitTransitionEnd', transitionEndCallback);
                    setTimeout(transitionEndCallback, speed + 100); // webkitTransitionEnd maybe not fire on lower version android.
                } else {
                    element.style.webkitTransition = '';
                    element.style.webkitTransform = `translate3d(${offset}px, 0, 0)`;
                }
            },

            reInitPages() {
                var children = this.$children;
                this.noDrag = children.length === 1 && this.noDragWhenSingle;

                var pages = [];
				var _index = this.index;
                //this.index = 0;

                children.forEach(function(child, index) {
                    pages.push({ el : child.$el, index : index });

                    if (index === _index) {
                        addClass(child.$el, 'active');
                    }
                    else{
                        removeClass(child.$el, 'active');
                    }
                });

                this.pages = pages;
            },

            doAnimate(towards, options) {
                if (this.$children.length === 0) return;
                if (!options && this.$children.length < 2) return;

                var prevPage, nextPage, currentPage, pageWidth, offsetLeft;
                var speed = this.speed || 300;
                var index = this.index;
                var pages = this.pages;
                var pageCount = pages.length;

                if (!options) {
                    pageWidth = this.$el.clientWidth;
                    currentPage = pages[index] ? pages[index].el : null;
                    prevPage = pages[index - 1] ? pages[index - 1].el : null;
                    nextPage = pages[index + 1] ? pages[index + 1].el : null;
                    if (this.continuous && pages.length > 1) {
                        if (!prevPage) {
                            prevPage = pages[pages.length - 1] ? pages[pages.length - 1].el : null;
                        }
                        if (!nextPage) {
                            nextPage = pages[0] ? pages[0].el : null;
                        }
                    }
                    if (prevPage) {
                        prevPage.style.display = 'block';
                        this.translate(prevPage, -pageWidth);
                    }
                    if (nextPage) {
                        nextPage.style.display = 'block';
                        this.translate(nextPage, pageWidth);
                    }
                } else {
                    prevPage = options.prevPage;
                    currentPage = options.currentPage;
                    nextPage = options.nextPage;
                    pageWidth = options.pageWidth;
                    offsetLeft = options.offsetLeft;
                }

                var newIndex;
                var oldPage = this.$children[index].$el;

                if (towards === 'prev') {
                    if (index > 0) {
                        newIndex = index - 1;
                    }
                    if (this.continuous && index === 0) {
                        newIndex = pageCount - 1;
                    }
                } else if (towards === 'next') {
                    if (index < pageCount - 1) {
                        newIndex = index + 1;
                    }
                    if (this.continuous && index === pageCount - 1) {
                        newIndex = 0;
                    }
                }

                var callback = () => {
                    if (newIndex !== undefined) {
                        var newPage = this.$children[newIndex].$el;
                        removeClass(oldPage, 'active');
                        addClass(newPage, 'active');

                        this.index = newIndex;
                    }

                    if (prevPage) {
                        prevPage.style.display = '';
                    }

                    if (nextPage) {
                        nextPage.style.display = '';
                    }

					////////////////////////////////dispatch event
                    eventHub.$emit("swipePageEnd",{ 'currIndex' : this.index });
                };

                setTimeout(() => {
                    if (towards === 'next') {
                    this.translate(currentPage, -pageWidth, speed, callback);
                    if (nextPage) {
                        this.translate(nextPage, 0, speed);
                    }
                } else if (towards === 'prev') {
                    this.translate(currentPage, pageWidth, speed, callback);
                    if (prevPage) {
                        this.translate(prevPage, 0, speed);
                    }
                } else {
                    this.translate(currentPage, 0, speed, callback);
                    if (typeof offsetLeft !== 'undefined') {
                        if (prevPage && offsetLeft > 0) {
                            this.translate(prevPage, pageWidth * -1, speed);
                        }
                        if (nextPage && offsetLeft < 0) {
                            this.translate(nextPage, pageWidth, speed);
                        }
                    } else {
                        if (prevPage) {
                            this.translate(prevPage, pageWidth * -1, speed);
                        }
                        if (nextPage) {
                            this.translate(nextPage, pageWidth, speed);
                        }
                    }
                }
            }, 10);
            },

            next() {
                this.doAnimate('next');
            },

            prev() {
                this.doAnimate('prev');
            },

            doOnTouchStart: function(event) {
                if (this.noDrag) return;

                var element = this.$el;
                var dragState = this.dragState;
                var touch = event.touches[0];

                dragState.startTime = new Date();
                dragState.startLeft = touch.pageX;
                dragState.startTop = touch.pageY;
                dragState.startTopAbsolute = touch.clientY;

                dragState.pageWidth = element.offsetWidth;
                dragState.pageHeight = element.offsetHeight;

                var prevPage = this.$children[this.index - 1];
                var dragPage = this.$children[this.index];
                var nextPage = this.$children[this.index + 1];

                if (this.continuous && this.pages.length > 1) {
                    if (!prevPage) {
                        prevPage = this.$children[this.$children.length - 1];
                    }
                    if (!nextPage) {
                        nextPage = this.$children[0];
                    }
                }

                dragState.prevPage = prevPage ? prevPage.$el : null;
                dragState.dragPage = dragPage ? dragPage.$el : null;
                dragState.nextPage = nextPage ? nextPage.$el : null;

                if (dragState.prevPage) {
                    dragState.prevPage.style.display = 'block';
                }

                if (dragState.nextPage) {
                    dragState.nextPage.style.display = 'block';
                }
            },

            doOnTouchMove: function(event) {
                if (this.noDrag) return;

                var dragState = this.dragState;
                var touch = event.touches[0];

                dragState.currentLeft = touch.pageX;
                dragState.currentTop = touch.pageY;
                dragState.currentTopAbsolute = touch.clientY;

                var offsetLeft = dragState.currentLeft - dragState.startLeft;
                var offsetTop = dragState.currentTopAbsolute - dragState.startTopAbsolute;

                var distanceX = Math.abs(offsetLeft);
                var distanceY = Math.abs(offsetTop);
                if (distanceX < 5 || (distanceX >= 5 && distanceY >= 1.73 * distanceX)) {
                    this.userScrolling = true;
                    return;
                } else {
                    this.userScrolling = false;
                    event.preventDefault();
                }
                offsetLeft = Math.min(Math.max(-dragState.pageWidth + 1, offsetLeft), dragState.pageWidth - 1);

                var towards = offsetLeft < 0 ? 'next' : 'prev';

                if (dragState.prevPage && towards === 'prev') {
                    this.translate(dragState.prevPage, offsetLeft - dragState.pageWidth);
                }
                this.translate(dragState.dragPage, offsetLeft);
                if (dragState.nextPage && towards === 'next') {
                    this.translate(dragState.nextPage, offsetLeft + dragState.pageWidth);
                }
            },

            doOnTouchEnd: function() {
                if (this.noDrag) return;

                var dragState = this.dragState;

                var dragDuration = new Date() - dragState.startTime;
                var towards = null;

                var offsetLeft = dragState.currentLeft - dragState.startLeft;
                var offsetTop = dragState.currentTop - dragState.startTop;
                var pageWidth = dragState.pageWidth;
                var index = this.index;
                var pageCount = this.pages.length;

                if (dragDuration < 300) {
                    let fireTap = Math.abs(offsetLeft) < 5 && Math.abs(offsetTop) < 5;
                    if (isNaN(offsetLeft) || isNaN(offsetTop)) {
                        fireTap = true;
                    }
                    if (fireTap) {
                        this.$children[this.index].$emit('tap');
                    }
                }

                if (dragDuration < 300 && dragState.currentLeft === undefined) return;

                if (dragDuration < 300 || Math.abs(offsetLeft) > pageWidth / 2) {
                    towards = offsetLeft < 0 ? 'next' : 'prev';
                }

                if (!this.continuous) {
                    if ((index === 0 && towards === 'prev') || (index === pageCount - 1 && towards === 'next')) {
                        towards = null;
                    }
                }

                if (this.$children.length < 2) {
                    towards = null;
                }

                this.doAnimate(towards, {
                    offsetLeft: offsetLeft,
                    pageWidth: dragState.pageWidth,
                    prevPage: dragState.prevPage,
                    currentPage: dragState.dragPage,
                    nextPage: dragState.nextPage
                });

                this.dragState = {};
            }
        },

        destroyed() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            if (this.reInitTimer) {
                clearTimeout(this.reInitTimer);
                this.reInitTimer = null;
            }
        },

        beforeDestroy : function(){
            var _this = this;
            eventHub.$off("swipeItemCreated",_this.doHandleSwipeItemCreated);
            eventHub.$off("swipeItemDestroyed",_this.doHandleSwipeItemDestroyed);
        },

        mounted() {
            var _this = this;
            this.$nextTick(function(){
                _this.ready = true;

                if (_this.auto > 0) {
                    _this.timer = setInterval(() => {
                                if (!_this.dragging && !_this.animating) {
                        _this.next();
                    }
                }, _this.auto);
                }

                _this.reInitPages();

                var element = _this.$el;

                element.addEventListener('touchstart', (event) => {
                    if (_this.prevent) {
                    event.preventDefault();
                }
                if (_this.animating) return;
                _this.dragging = true;
                _this.userScrolling = false;
                _this.doOnTouchStart(event);
            });
                element.addEventListener('touchmove', (event) => {
                    if (!_this.dragging) return;
                _this.doOnTouchMove(event);
            });

                element.addEventListener('touchend', (event) => {
                    if (_this.userScrolling) {
                    _this.dragging = false;
                    _this.dragState = {};
                    return;
                }
                if (!_this.dragging) return;
                _this.doOnTouchEnd(event);
                _this.dragging = false;
            });
        });
        }
    };
</script>