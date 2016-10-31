<style>
  @import '../styles/components/loadmore.css';
</style>
<template>
  <div class="mint-loadmore">
    <div class="mint-loadmore-content" :class="{ 'is-dropped': topDropped}" :style="{ 'transform': 'translate3d(0, ' + translate + 'px, 0)' }" ref="loadmoreContent">
      <slot name="top">
        <div class="mint-loadmore-top">
         <!-- <spinner v-if="topStatus === 'loading'" class="mint-loadmore-spinner" :size="20" type="fading-circle"></spinner>-->
          <span class="mint-loadmore-text">{{ topText }}</span>
        </div>
      </slot>
      <slot></slot>
    </div>
  </div>
</template>

<script type="text/babel">
  import { eventHub } from '../libs/hub';

  export default {
    props: {
      autoFill: {
        type: Boolean,
        default: true
      },
      topPullText: {
        type: String,
        default: '下拉刷新'
      },
      topDropText: {
        type: String,
        default: '释放更新'
      },
      topLoadingText: {
        type: String,
        default: '加载中...'
      },
      topDistance: {
        type: Number,
        default: 70
      },
      topMethod: {
        type: Function
      }
    },

    data() {
      return {
        uuid: null,
        translate: 0,
        scrollEventTarget: null,
        containerFilled: false,
        topText: '',
        topDropped: false,
        direction: '',
        startY: 0,
        startScrollTop: 0,
        currentY: 0,
        topStatus : ""
      };
    },

    watch: {
      topStatus(val) {
        switch (val) {
          case 'pull':
            this.topText = this.topPullText;
            break;
          case 'drop':
            this.topText = this.topDropText;
            break;
          case 'loading':
            this.topText = this.topLoadingText;
            break;
        }
      }
    },

    methods: {
      getScrollEventTarget(element) {
        let currentNode = element;
        while (currentNode && currentNode.tagName !== 'HTML' && currentNode.tagName !== 'BODY' && currentNode.nodeType === 1) {
          let overflowY = document.defaultView.getComputedStyle(currentNode).overflowY;
          if (overflowY === 'scroll' || overflowY === 'auto') {
            return currentNode;
          }
          currentNode = currentNode.parentNode;
        }
        return window;
      },

      getScrollTop(element) {
        if (element === window) {
          return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop);
        } else {
          return element.scrollTop;
        }
      },

      bindTouchEvents() {
        this.$el.addEventListener('touchstart', this.handleTouchStart);
        this.$el.addEventListener('touchmove', this.handleTouchMove);
        this.$el.addEventListener('touchend', this.handleTouchEnd);
      },

      beforeCreate() {
        this.topStatus = 'pull';
        this.topText = this.topPullText;
        this.scrollEventTarget = this.getScrollEventTarget(this.$el);
        if (typeof this.topMethod === 'function') {
          this.bindTouchEvents();
        }
      },

      fillContainer() {
        if (this.autoFill) {
          this.$nextTick(() => {
            if (this.scrollEventTarget === window) {
              this.containerFilled = this.$el.getBoundingClientRect().bottom >= document.documentElement.getBoundingClientRect().bottom;
            } else {
              this.containerFilled = this.$el.getBoundingClientRect().bottom >= this.scrollEventTarget.getBoundingClientRect().bottom;
            }
            if (!this.containerFilled) {
            }
          });
        }
      },

      checkBottomReached() {
        if (this.scrollEventTarget === window) {
          return document.body.scrollTop + document.documentElement.clientHeight === document.body.scrollHeight;
        } else {
          return this.$el.getBoundingClientRect().bottom === this.scrollEventTarget.getBoundingClientRect().bottom;
        }
      },

      handleTouchStart(event) {
        this.startY = event.touches[0].clientY;
        this.startScrollTop = this.getScrollTop(this.scrollEventTarget);
        if (this.topStatus !== 'loading') {
          this.topStatus = 'pull';
          this.topDropped = false;
        }
      },

      handleTouchMove(event) {
        if (this.startY < this.$el.getBoundingClientRect().top && this.startY > this.$el.getBoundingClientRect().bottom) {
          return;
        }
        this.currentY = event.touches[0].clientY;
        let distance = this.currentY - this.startY;
        this.direction = distance > 0 ? 'down' : 'up';
        if (typeof this.topMethod === 'function' && this.direction === 'down' && this.getScrollTop(this.scrollEventTarget) === 0 && this.topStatus !== 'loading') {
          event.preventDefault();
          event.stopPropagation();
          this.translate = distance - this.startScrollTop;
          if (this.translate < 0) {
            this.translate = 0;
          }
          this.topStatus = this.translate >= this.topDistance ? 'drop' : 'pull';
        }
      },

      handleTouchEnd() {
        if (this.direction === 'down' && this.getScrollTop(this.scrollEventTarget) === 0 && this.translate > 0) {
          this.topDropped = true;
          if (this.topStatus === 'drop') {
            this.translate = '50';
            this.topStatus = 'loading';
            this.topMethod(this.uuid);
          } else {
            this.translate = '0';
            this.topStatus = 'pull';
          }
        }
        this.direction = '';
      },

      handlerTopLoaded(id){
        if (id === this.uuid) {
          this.translate = 0;
          setTimeout(() => {
            this.topStatus = 'pull';
        }, 200);
        }
      }
    },

    mounted() {
      var _this = this;
      _this.uuid = Math.random().toString(36).substring(3, 8);
      _this.$nextTick(function(){
        _this.beforeCreate();
      });
    },

    created() {
      eventHub.$on("onTopLoaded",this.handlerTopLoaded);
    },

    beforeDestroy() {
      eventHub.$off("onTopLoaded",this.handlerTopLoaded);
    }
  };
</script>