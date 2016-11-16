<template>
    <div class="page club-list-page" id="club-list-nearby-page" v-show="!global.loading">
        <div class="search">
            <router-link :to="{ name : 'inviteCode' , query : { tmp_clubSource : '9358' } }">添加会所</router-link>
            <router-link tag="div" :to="{ name : 'clubList-search' }"><span>搜索</span></router-link>
        </div>
        <div class="title">附近会所
            <router-link :to="{ name : 'clubList-all' }">查看全部</router-link>
        </div>
        <div class="list" :style="{ height : (global.winHeight-7.491*global.winScale*16)+'px' }">
            <club v-for="item in dataList" :club-obj="item" key="item.id"></club>
            <div class="data-load-tip" :class="{ none : !dataLoading }"><i></i>
                <div>加载数据</div>
            </div>
            <div class="nullData" v-show="dataList.length==0 && !dataLoading">
                <div></div>
                <div>暂无内容...</div>
            </div>
            <router-link :to="{ name : 'clubList-all' }" tag="div" class="view-all"
                         v-show="!dataLoading && dataList.length!=0">查看全部会所
            </router-link>
        </div>
    </div>
</template>
<script>
    import {Global} from '../libs/global'
    import Club from '../components/club'

    module.exports = {
        components: {
            'club': Club
        },
        data: function () {
            return {
                global: Global.data,
                dataLoading: false,
                dataList: []
            }
        },
        created: function () {
            var _this = this
            var global = _this.global
            _this.dataLoading = true
            _this.$http.get('../api/v2/club/near/clubs', {
                params: {
                    lngx: global.currLngx || '',
                    laty: global.currLaty || ''
                }
            }).then(function (res) {
                _this.dataLoading = false
                res = res.body
                if (res.statusCode == 200) {
                    _this.dataList = res.respData
                }
            })
        }
    }
</script>
