<template>
	<view>
		<u-row gutter="10" justify="center" class="first_line">
			<u-col span="1">
				X:
			</u-col>
			<u-col span="10">
				<u-line-progress class="progress_line" :striped="true" :percent="local_x/10 * 100"
				 :striped-active="true" :show-percent="false"></u-line-progress>
			</u-col>
		</u-row>
		<u-row gutter="10" justify="center">
			<u-col span="1">
				Y:
			</u-col>
			<u-col span="10">
				<u-line-progress class="progress_line" :striped="true" :percent="local_y/10 * 100"
				 :striped-active="true" :show-percent="false"></u-line-progress>
			</u-col>
		</u-row>
		<u-row gutter="10" justify="center" class="last_line">
		<u-col span="1">
				Z:
			</u-col>
			<u-col span="10">
				<u-line-progress class="progress_line" :striped="true" :percent="local_z/10 * 100"
				 :striped-active="true" :show-percent="false"></u-line-progress>
			</u-col>
		</u-row>

		<!-- <u-row gutter="10" justify="around">
			<u-col span="4">
				<u-button class="button_1" @click="start_listen(1000)" :disabled="!start_button" size="medium">Start 1 second</u-button>
			</u-col>
			<u-col span="4">
				<u-button class="button_1" @click="start_listen(30000)" :disabled="!start_button" size="medium">Start 30 second</u-button>
			</u-col>
		</u-row> -->

		<u-row gutter="10" justify="around">
			<!-- <u-col span="4">
				<u-button class="button_1" @click="start_listen(60000)" :disabled="!start_button" size="medium">Start 60 second</u-button>
			</u-col> -->
			<u-col span="4">
				<u-button class="button_1" @click="stop_listen" :disabled="!end_button" size="medium">Stop listen</u-button>
			</u-col>
			<u-col span="4">
				<u-button class="button_1" @click="test_diretory"  size="medium">test_diretory</u-button>
			</u-col>
		</u-row>
		
		<u-row gutter="10" justify="around">
			<u-col span="4">
				<u-button class="button_1" @click="start_listen(33)" :disabled="!start_button" size="medium">Start 30 hz</u-button>
			</u-col>
			<!-- <u-col span="4">
				<u-button class="button_1" @click="start_listen(16)" :disabled="!start_button" size="medium">Start 60 hz</u-button>
			</u-col> -->
			<u-col span="4">
				<u-button class="button_1" @click="delete_cache"  size="medium">Delete Cache</u-button>
			</u-col>
		</u-row>
		
		<!-- <u-row gutter="10" justify="around">
			<u-col span="4">
				<u-button class="button_1" @click="start_listen(10)" :disabled="!start_button" size="medium">Start 100 hz</u-button>
			</u-col>
			<u-col span="4">
				<u-button class="button_1" @click="delete_cache"  size="medium">Delete Cache</u-button>
			</u-col>
		</u-row> -->
		
		<u-row gutter="10" justify="around">
<!-- 			<u-col span="4">
				<u-button class="button_1" @click="show = true"  size="medium">{{selected_date}}</u-button>
			</u-col> -->
			
			<u-col span="4">
				<u-button class="button_1" @click="show = true"  size="medium">Export File</u-button>
			</u-col>
<!-- 			<u-col span="4">
				<u-button class="button_1" @click="test_push"  size="medium">Push</u-button>
			</u-col>
			<u-col span="4">
				<u-button class="button_1" @click="test_clear_push"  size="medium">Clear Push</u-button>
			</u-col> -->
		</u-row>
		<u-calendar v-model="show" :mode="date" @change="export_file"></u-calendar>
		<u-toast ref="uToast" />

	</view>
</template>

<script>
	import {add_a_row,now_date,file_writer,get_files,sleep} from './helper.js'
	export default {
		data() {
			return {
				init_step: 0,
				step_list:[],
				local_x: '',
				local_y: '',
				local_z: '',
				local_time: '',
				user_id: '',
				start_button: true,
				end_button: false,
				save_button: false,
				clear_button: true,
				user : {},
				wid :'',
				golbal_event:{
					step:''
				},
				// 日历
				show: false,
				// 单一日期模式
				date: 'date',
				// 用于展示的date
				selected_date: 'Select date'
				
			}
		},
		onLoad: function(option) {
			this.user_id = option.user_name
			uni.getStorage({
				key: this.user_id,
				success: (res)=>{
					this.user = res.data;
				}
		})},
		mounted() {
			var self = this
			// 计步器
			// 注册计步器
			var step = uni.requireNativePlugin('DC-StepCounter');
			// 注册globalEvent
			var globalEvent = uni.requireNativePlugin('globalEvent');
			// 计步器
			// 监听globalEvent事件 StepCounter_Ready 在ready后调用计步器相关API
			globalEvent.addEventListener("StepCounter_Ready", function (e) {
					step.getCurrentTimeSportStep(function(n) {
					    self.init_step = n
						console.log('init step is ---',n)
					})
			});
			//调用初始化 先注册StepCounter_Ready事件 再调用initialize初始化 防止StepCounter_Ready事件丢失
			step.initialize()
			// 绑定data变量以在其他方法中调用
			this.golbal_event.step = step
			
			// 注册保活程序
			const hgService = uni.requireNativePlugin("HG-Background");
			hgService.config({
			    title:"HAcceleration Service",
			    content:"Now Running",
			    mode: 1, //0省电模式 1流氓模式
			})
			// 打开安全管理
			hgService.showSafeSetting()
			// 检测是否限制后台运行
			var result=hgService.checkIfLimited()
			console.log(result)
			// 申请后台运行
			hgService.requestIgnoreLimit()
			// 启动前台服务
			hgService.startService()
			
		},
		beforeDestroy(){
			console.log('now unload app')
			// clear cache
			this.local_x = []
			this.local_y = []
			this.local_z = []
			this.local_time = []
			this.step_list = []
			this.init_step = 0
			this.interval_cache = 0
			
		},
		methods: {
			stop_listen() {
				this.end_button = false
				this.start_button = true
				this.save_button = true
				clearInterval(this.inerval_id)
				this.$refs.uToast.show({
									title: 'Successfully Stop',
									type: 'success'
								})
				console.log('success stop Interval')
				
				// 关闭监听器
				plus.accelerometer.clearWatch( this.wid )
			},
			start_listen(milisec) {
				this.$refs.uToast.show({
									title: 'start listen~',
									type: 'success'
								})
				this.end_button = true
				this.start_button = false
				this.save_button = false
				const self = this
				// 首先获取开始时间
				var myDate = new Date()
				// self.local_time.push("" + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds())
				console.log('start listen')
				
				
				
				// 获取初始步数
				self.golbal_event.step.getCurrentTimeSportStep(function(n) {
					self.init_step = n
				})
				// 计步器时间缓存
				var step_time_cache = 0
				// 使用watch 监听设备加速度变化
				
				//设置字符串缓存变量
				var data_cache = ''
				
				// 表头
				var header = "" + "userName" + "," + "Student number" + ","+"Age" + ","+ "Gender" +"," + "Weight"+"," + "Height"+ "\r\n"
				var header_file = header + "" + this.user_id + ","+ this.user.student_number +","+ this.user.age +"," + this.user.sex +"," +this.user.weight+","+this.user.height+"\r\n" + "y,x,z,steps/Minute,time\r\n"
				
				this.wid = plus.accelerometer.watchAcceleration( function ( a ) {
					// 更新显示
					self.local_x = a.xAxis
					self.local_y = a.yAxis
					self.local_z = a.zAxis

					// 计入步数 
					if(step_time_cache < 60000){
						step_time_cache = step_time_cache + milisec
						// 拼接字符串
						data_cache = data_cache + add_a_row(a.xAxis,a.yAxis,a.zAxis,'',myDate,milisec)
					}else{
					
						self.golbal_event.step.getCurrentTimeSportStep(function(n) {
							// 计算一分钟内的所有步数
							var step_per_minute = n - self.init_step 
							// 拼接字符串
							data_cache = data_cache + add_a_row(a.xAxis,a.yAxis,a.zAxis,step_per_minute,myDate,milisec)
							self.init_step = n
						})
						step_time_cache = 0
					}
					
					// 数据存储
					if (data_cache.length >= 800000 ){
						// 当字符串长度大于1000000时，也就是存储大于60kb时
						var storage_data = data_cache // 设置存储副本
						data_cache = '' // 清空缓存
						file_writer(self.user_id,storage_data,header_file)
					}
					
				}, function ( e ) {
					plus.nativeUI.alert("watchAcceleration error: " + JSON.stringify(e)); 
				}, {frequency:milisec}); // 设置更新间隔时间为 milisec ms

				
				
			},
			export_file(e) {
				// 获取回调日期参数
				const selected_date = e.result
				
				// 表头
				var header = "" + "userName" + "," + "Student number" + ","+"Age" + ","+ "Gender" +"," + "Weight"+"," + "Height"+ "\r\n"
				var acc_file = header + "" + this.user_id + ","+ this.user.student_number +","+ this.user.age +"," + this.user.sex +"," +this.user.weight+","+this.user.height+"\r\n" + "y,x,z,steps/Minute,time\r\n"
				// 时间节点
				var myDate = new Date()
				var now_time = "" + myDate.getMonth() + "-" + myDate.getDate() + "-" + myDate.getHours() + "-" + myDate.getMinutes()
				const self = this
				var final_file = get_files(acc_file,this.user_id,selected_date,self)
				
				
				console.log(plus.io.PUBLIC_DOCUMENTS)
				// 存储并导出文件
				file_writer(this.user_id,now_time,final_file)
				
				this.$refs.uToast.show({
									title: 'Successfully exported',
									type: 'success'
								})
				console.log('success exported')
			},
			delete_cache(){
				var keys = plus.storage.getAllKeys()
				keys = keys.filter(item => item.slice(0,13) === 'HAcceleration')
				for(var i in keys ){
					plus.storage.removeItem(keys[i])
				}
				this.$refs.uToast.show({
									title: 'Successfully deleted',
									type: 'success'
								})
				console.log(plus.storage.getAllKeys())
			},
			async test_diretory(){
				for(var i = 0; i < 10; i++){
					file_writer('songzihan' ,''+i+ '-- nihaoa\r\n','Header\r\n')
					await sleep(100)
				}
				this.$refs.uToast.show({
									title: 'Successfully writed',
									type: 'success'
								})
			},
			

		}
	}
</script>

<style scoped>

	.progress_line {
		margin: 20px 0;
	}
	.button_1{
		width: 250rpx;
		margin: 20px 0;
	}
	.first_line {
		margin-top: 100px;
	}
	.last_line {
		margin-bottom: 50px;
	}
	
	
</style>
