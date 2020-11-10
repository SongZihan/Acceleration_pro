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

		<u-row gutter="10" justify="around">
			<!-- <u-col span="4">
				<u-button class="button_1" @click="start_listen(60000)" :disabled="!start_button" size="medium">Start 60 second</u-button>
			</u-col> -->
			<u-col span="4">
				<u-button class="button_1" @click="stop_listen" :disabled="!end_button" size="medium">Stop listen</u-button>
			</u-col>
			<!-- <u-col span="4">
				<u-button class="button_1" @click="test_diretory"  size="medium">test_diretory</u-button>
			</u-col> -->
		</u-row>
		
		<u-row gutter="10" justify="around">
			<u-col span="4">
				<u-button class="button_1" @click="start_listen(33)" :disabled="!start_button" size="medium">Start 30 hz</u-button>
			</u-col>
			<u-col span="4">
				<u-button class="button_1" @click="start_listen(60000)" :disabled="!start_button" size="medium">Start 60s</u-button>
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
			<u-col span="4">
				<u-button class="button_1" @click="start_listen(10)" :disabled="!start_button" size="medium">Start 100HZ</u-button>
			</u-col>
<!-- 			<u-col span="4">
				<u-button class="button_1" @click="show = true"  size="medium">{{selected_date}}</u-button>
			</u-col> -->
			
			<!-- <u-col span="4">
				<u-button class="button_1" @click="show = true"  size="medium">Export File</u-button>
			</u-col> -->
<!-- 			<u-col span="4">
				<u-button class="button_1" @click="test_push"  size="medium">Push</u-button>
			</u-col>
			<u-col span="4">
				<u-button class="button_1" @click="test_clear_push"  size="medium">Clear Push</u-button>
			</u-col> -->
		</u-row>
		<!-- <u-calendar v-model="show" :mode="date" @change="export_file"></u-calendar> -->
		<u-toast ref="uToast" />

	</view>
</template>

<script>
	import {add_a_row,add_a_row_orientation,now_date,file_writer,get_files,sleep} from './helper.js'
	export default {
		data() {
			return {
				init_step: 0,
				local_x: '',
				local_y: '',
				local_z: '',
				user_id: '',
				start_button: true,
				end_button: false,
				user : {},
				wid :'',
				orientation_wid:'',
				golbal_event:{
					step:''
				},
				// 日历
				show: false,
				// 单一日期模式
				date: 'date',
				// 用于展示的date
				selected_date: 'Select date',
				// 数据缓存
				data_cache:'',
				orientation_cache: '',
				orientation_header_file:'',
				acceleration_header_file: '',
				// 数据抽取间隔
				time_type:''
				
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
			this.init_step = 0
			this.interval_cache = 0
			
		},
		methods: {
			stop_listen() {
				this.end_button = false
				this.start_button = true
				
				
				// 关闭监听器
				plus.accelerometer.clearWatch( this.wid )
				plus.orientation.clearWatch(this.orientation_wid)
				
				
				// 当用户点击stop的时候将内存中的数据存入文件
				file_writer(this.user_id,this.data_cache,this.acceleration_header_file,'acceleration',this.time_type)
				
				file_writer(this.user_id,this.orientation_cache,this.orientation_header_file,'orientation',this.time_type)
				
				// 文件写入之后应该将缓存清空以防止重复写入
				this.data_cache = ''
				this.orientation_cache = ''
				
				
				
				this.$refs.uToast.show({
									title: 'Successfully Stop',
									type: 'success'
								})
								
			},
			start_listen(milisec) {
				
				// 触发定位服务许可
				plus.geolocation.getCurrentPosition()
				
				this.$refs.uToast.show({
									title: 'start listen~',
									type: 'success'
								})
				this.end_button = true
				this.start_button = false
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
				
				//设置字符串缓存变量
				this.data_cache = ''
				
				// 表头
				var header = "" + "userName" + "," + "Student number" + ","+"Age" + ","+ "Gender" +"," + "Weight"+"," + "Height"+ "\r\n"
				this.acceleration_header_file = header + "" + this.user_id + ","+ this.user.student_number +","+ this.user.age +"," + this.user.sex +"," +this.user.weight+","+this.user.height+"\r\n" + "y,x,z,magnitude,steps/Minute,time\r\n"
				this.orientation_header_file = header + "" + this.user_id + ","+ this.user.student_number +","+ this.user.age +"," + this.user.sex +"," +this.user.weight+","+this.user.height+"\r\n" + "alpha,beta,gamma,magneticHeading,trueHeading,headingAccuracy,latitude,longitude,altitude,accuracy,altitudeAccuracy,heading,speed,time\r\n"
				
				// 抽取时间的间隔
				if(milisec === 33){
					this.time_type = '30hz'
				}else if (milisec === 60000){
					this.time_type = '60s'
				}else if (milisec === 10){
					this.time_type = '100HZ'
				}
				
				// 使用watch 监听设备加速度变化
				this.wid = plus.accelerometer.watchAcceleration( function ( a ) {
					// 更新显示
					self.local_x = a.xAxis
					self.local_y = a.yAxis
					self.local_z = a.zAxis

					// 计入步数 
					if(step_time_cache < 60000){
						step_time_cache += milisec
						// 拼接字符串
						self.data_cache += add_a_row(a.xAxis,a.yAxis,a.zAxis,'',myDate,milisec)
					}else{
					
						self.golbal_event.step.getCurrentTimeSportStep(function(n) {
							// 计算一分钟内的所有步数
							var step_per_minute = n - self.init_step 
							// 拼接字符串
							self.data_cache += add_a_row(a.xAxis,a.yAxis,a.zAxis,step_per_minute,myDate,milisec)
							self.init_step = n
						})
						// 必须计入本次的循环时间
						step_time_cache = milisec
					}
					
					
					// 数据存储
					if (self.data_cache.length >= 800000 ){
						// 当字符串长度大于1000000时，也就是存储大于60kb时
						var storage_data = self.data_cache // 设置存储副本
						self.data_cache = '' // 清空缓存
						file_writer(self.user_id,storage_data,self.acceleration_header_file,'acceleration',self.time_type)
					}
					
				}, function ( e ) {
					plus.nativeUI.alert("watchAcceleration error: " + JSON.stringify(e)); 
				}, {frequency:milisec}); // 设置更新间隔时间为 milisec ms
				
				// 方向监听器时间缓存
				var time_orientation_cache = 0
				
				// 定义用于方位器监听器的时间变量
				var date_for_orientation = new Date()
				
				// 监听设备的方向和定位
				this.orientation_wid = plus.orientation.watchOrientation( function(rotation){
					
					// 每分钟计入一次定位数据
					if(time_orientation_cache < 60000){
						time_orientation_cache += milisec
						// 拼接字符串
						self.orientation_cache += add_a_row_orientation(rotation,'',date_for_orientation,milisec)
					}else{
					
						// 获取用户定位数据
						plus.geolocation.getCurrentPosition(function(position){
							
							self.orientation_cache += add_a_row_orientation(rotation,position,date_for_orientation,milisec)
							
						}, function(){}, {enableHighAccuracy:true})
						
						time_orientation_cache = 0
					}
					// 数据存储
					if (self.orientation_cache.length >= 800000 ){
						// 当字符串长度大于1000000时，也就是存储大于60kb时
						var storage_data_orientation = self.orientation_cache // 设置存储副本
						self.orientation_cache = '' // 清空缓存
						file_writer(self.user_id,storage_data_orientation,self.orientation_header_file,'orientation',self.time_type)
					}
					
				},
				function ( e ) {plus.nativeUI.alert("watchAcceleration error: " + JSON.stringify(e)); 
				}, {frequency:milisec} )
				
				
			}
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
