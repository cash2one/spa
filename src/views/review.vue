<style>
    @import '../styles/page/review.css';
</style>
<template>
    <div class="page" id="review-list-page" v-show="!global.loading">
            <div class="page-title">
                <a class="back" @click="doClickPageBack()"></a>评论列表
                <div class="comment-select" :class="{ active : showCommentTypeSelect }" @click="doShowCommentTypeSelect()">
                    <span>{{currType == 'order' ? '订单评论' : ( currType == 'tech' ? '粉丝评论' : '全部评论' )}}</span>
                    <div></div>
                    <ul>
                        <li @click="doSelectCommentType('')" :class="{ selected : currType=='' }">全部评论<i></i><i></i></li>
                        <li @click="doSelectCommentType('order')" :class="{ selected : currType=='order' }">订单评论</li>
                        <li @click="doSelectCommentType('tech')" :class="{ selected : currType=='tech' }">粉丝评论</li>
                    </ul>
                </div>
            </div>
            <div class="comment-list" ref="listEle" :style="{ height : (global.winHeight-2.611*global.winScale*16)+'px' }" @scroll="doHandlerCommentListScroll()">
                <div class="comment-item" v-for="item in comments">
                    <div>
                        <div :style="{ backgroundImage : 'url('+(item.avatarUrl || global.defaultHeader)+')' }"></div>
                        <div>{{ ((!item.name || item.name=="null") ? "匿名用户" : item.name ) }}</div>
                        <div>{{item.createdAt}}</div>
                        <div>{{item.commentTypeName}}</div>
                    </div>
                    <div>
                        <div><div :style="{ width : item.rate+'%' }"></div></div>
                        <div v-show="item.rewardAmount != 0"><i></i>打赏：<span>{{item.rewardAmount}}</span>元</div>
                    </div>
                    <div v-show="item.comment">{{item.comment}}</div>
                </div>
                <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><i></i><div>加载数据</div></div>
                <div class="finish-load-tip" :class="{ none : !showFinishLoadTip }"><div>已加载完全部数据</div></div>
                <div class="nullData" v-show="comments.length==0 && !isAddData"><div></div><div>暂无内容...</div></div>
            </div>
        </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                queryTechCommentsUrl : "../api/v2/club/technician/comments",
                pageSize : 20,
                currPage : 1,
                currType : "",
                techId : Global.data.currPage.query.id,
                comments : [],

                showDataLoadTip : false, //显示数据正在加载
                showFinishLoadTip : false,//显示已经加载完成
                isDataAddEnd : false,//数据是否已加载完
                isAddData : false,//数据是否正在加载

                showCommentTypeSelect : false
            };
        },
        created : function(){
            var _this = this, global = _this.global;
            if(global.currPage.query.id == undefined){//链接上无技师id
                return _this.$router.back();
            }
            global.loading = true;
            _this.$http.get(_this.queryTechCommentsUrl, { params : {
                page : _this.currPage,
                pageSize : _this.pageSize,
                type : _this.currType,
                techId : _this.techId
            }}).then(function(res){
                res = res.body;
                global.loading = false;
                if(res.statusCode == 200){
                    res = res.respData;
                    if(res.length == 0){
                        _this.isDataAddEnd = true;
                    }
                    else if(res.length < _this.pageSize){
                        _this.isDataAddEnd = true;
                        _this.showFinishLoadTip = true;
                    }
                    _this.comments = res;
                }
                else{
                    Util.tipShow(global.loadError);
                    _this.$router.back();
                }
            }, function(){
                Util.tipShow(global.loadError);
                global.loading = false;
                _this.$router.back();
            });
        },
        methods: {
            doSelectCommentType : function(type){
                var _this = this;
                if(_this.currType != type){
                    _this.currType = type;
                    _this.queryCommentData(1);
                }
            },
            doShowCommentTypeSelect : function(){
                this.showCommentTypeSelect = !this.showCommentTypeSelect;
            },
            doClickPageBack : function(){//点击返回按钮
                history.back();
            },
            queryCommentData : function(page){//查询列表数据
                var _this = this;
                if(_this.isAddData){
                    return;
                }
                _this.isAddData = true;
                page = page || _this.currPage+1;

                //更新数据加载提示
                _this.showDataLoadTip = true;
                _this.showFinishLoadTip = false;
                _this.isDataAddEnd = false;

                _this.$http.get(_this.queryTechCommentsUrl, { params: {
                    page: page,
                    pageSize: _this.pageSize,
                    type : _this.currType,
                    techId : _this.techId
                }}).then(function (res) {
                    res = res.body;
                    if (res.statusCode == 200) {
                        res =  res.respData;
                        if(page==1){
                            _this.comments = res;
                            if(res.length == 0){
                                _this.isDataAddEnd = true;
                            }
                            else if(res.length < _this.pageSize){
                                _this.isDataAddEnd = true;
                                _this.showFinishLoadTip = true;
                            }
                        }
                        else{
                            for(var i=0;i<res.length;i++){
                                _this.comments.push(res[i]);
                            }
                            if(res.length < _this.pageSize){
                                _this.isDataAddEnd = true;
                                _this.showFinishLoadTip = true;
                            }
                        }
                        _this.currPage = page;
                        _this.isAddData = false;
                        _this.showDataLoadTip = false;
                    }
                    else {
                        Util.tipShow(_this.global.loadError);
                    }
                }, function () {
                    Util.tipShow(_this.global.loadError);
                });
            },
            doHandlerCommentListScroll : function(){//列表的滚动加载
                var _this = this, listEle = _this.$refs.listEle;
                if(!_this.isDataAddEnd && listEle.scrollTop+listEle.clientHeight*1.4>listEle.scrollHeight ){
                    _this.queryCommentData();
                }
            }
        }
    }
</script>