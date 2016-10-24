<style>
    @import '../styles/page/clubList.css';
</style>
<template>
    <div class="page" id="club-list-page" v-show="!global.loading">
        <router-view></router-view>
    </div>
</template>
<script>
    import Vue from 'vue';
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                currCity : "",
                currRegion : "",
                isOldUser : Util.localStorage('viewClubType') == 4,
                clubTags : [],
                techTags : []
            }
        },
        beforeRouteEnter : function(to,from,next){
            var global = Global.data, authCode = to.query.code;
            if(global.userAgent.isWX && (!global.openId || global.openId.length<10)){
                if(authCode){
                    Global.getOpenId().then(function(res){
                        next(function(vm){
                            vm.init();
                        });
                    },function(err){
                        Util.tipShow(err);
                    });
                }
                else{
                    Global.getOauthCode('','9358','9358','base');
                    next(false);
                }
            }
            else{
                next(function(vm){
                    vm.init();
                });
            }
        },
        created : function(){

        },
        methods: {
            init : function(){
                var _this = this, global = _this.global, currPage = global.currPage;
                if(currPage.name == "clubList"){
                    var searchText = currPage.query['search_text'];
                    if(searchText){
                        _this.$router.push({ name : "clubList-search", query : { 'search_text' : searchText }});
                    }
                    else{
                        _this.$router.push({ name : "clubList-"+(_this.isOldUser ? "all" : "nearby") });
                    }
                }
                _this.initLocationInfo();
            },

            //初始化位置信息
            initLocationInfo : function(){
                var _this = this, global = _this.global;
                if(global.currLngx && global.currLaty){
                    Global.waitAMapInit().then(function(){

                        ///////初始化位置信息
                        var mapObj, geocoder, lnglatXY = new AMap.LngLat(global.currLngx,global.currLaty);

                        //加载地理编码插件
                        mapObj = new AMap.Map("mapInfo", {
                            resizeEnable : false,
                            view : new AMap.View2D({
                                zoom:15,
                                center : lnglatXY
                            })
                        });

                        mapObj.plugin(["AMap.Geocoder"],function(){
                            geocoder=new AMap.Geocoder({
                                radius : 1000, //以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
                                extensions : "all"//返回地址描述以及附近兴趣点和道路信息，默认"base"
                            });
                            //返回地理编码结果
                            AMap.event.addListener(geocoder, "complete",function(data){
                                var address = data.regeocode.addressComponent;
                                _this.currCity = address.city || address.province;
                                _this.currRegion = address.district;
                                _this.queryClubTags();///查询会所标签
                            });
                            //逆地理编码
                            geocoder.getAddress(lnglatXY);
                        });

                    },function(){
                        Util.tipShow("高德地图初始化失败！")
                    })
                }
                else if(global.userAgent.isWX){
                    Util.tipShow('请打开"9358"公众号的位置信息！');
                }
            },

            //查询会所标签
            queryClubTags : function(){
                var _this = this, global = _this.global;
                _this.$http.post("../api/v2/club/tags",{
                    city : encodeURIComponent(_this.currCity || ''),
                    region : encodeURIComponent(_this.currRegion || ''),
                    laty : global.currLaty || 0,
                    lngx : global.currLngx || 0
                }).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        res = res.respData;
                        if(res && res instanceof Array){
                            _this.clubTags = res;
                        }
                    }
                    else{
                        Util.tipShow(res.msg || "查询会所标签数据出错！");
                    }
                });
            },

            //查询技师标签
            queryTechTags : function(){
                var _this = this;
                _this.$http.get("../api/v2/club/impression/list").then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        _this.techTags = res.respData;
                    }
                    else{
                        Util.tipShow(res.msg || "查询印象标签数据出错！");
                    }
                });
            }
        }
    }
</script>