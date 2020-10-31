<template>
	<view>
		<u-row gutter="10" justify="center" class="first_line">
			<u-col span="1">
				X:
			</u-col>
			<u-col span="10">
				<u-line-progress class="progress_line" :striped="true" :percent="local_x[local_x.length-1]/10 * 100"
				 :striped-active="true" :show-percent="false"></u-line-progress>
			</u-col>
		</u-row>
		<u-row gutter="10" justify="center">
			<u-col span="1">
				Y:
			</u-col>
			<u-col span="10">
				<u-line-progress class="progress_line" :striped="true" :percent="local_y[local_y.length-1]/10 * 100"
				 :striped-active="true" :show-percent="false"></u-line-progress>
			</u-col>
		</u-row>
		<u-row gutter="10" justify="center" class="last_line">
			<u-col span="1">
				Z:
			</u-col>
			<u-col span="10">
				<u-line-progress class="progress_line" :striped="true" :percent="local_z[local_z.length-1]/10 * 100"
				 :striped-active="true" :show-percent="false"></u-line-progress>
			</u-col>
		</u-row>

		<u-row gutter="10" justify="around">
			<u-col span="4">
				<u-button class="button_1" @click="start_listen(1000)" :disabled="!start_button" size="medium">Start 1 second</u-button>
			</u-col>
			<u-col span="4">
				<u-button class="button_1" @click="start_listen(30000)" :disabled="!start_button" size="medium">Start 30 second</u-button>
			</u-col>
		</u-row>

		<u-row gutter="10" justify="around">
			<u-col span="4">
				<u-button class="button_1" @click="start_listen(60000)" :disabled="!start_button" size="medium">Start 60 second</u-button>
			</u-col>
			<u-col span="4">
				<u-button class="button_1" @click="stop_listen" :disabled="!end_button" size="medium">Stop listen</u-button>
			</u-col>
		</u-row>
		
		<u-row gutter="10" justify="around">
			<u-col span="4">
				<u-button class="button_1" @click="start_listen(33)" :disabled="!start_button" size="medium">Start 30 hz</u-button>
			</u-col>
			<u-col span="4">
				<u-button class="button_1" @click="start_listen(16)" :disabled="!start_button" size="medium">Start 60 hz</u-button>
			</u-col>
		</u-row>
		
		<u-row gutter="10" justify="around">
			<u-col span="4">
				<u-button class="button_1" @click="start_listen(1)" :disabled="!start_button" size="medium">Start 100 hz</u-button>
			</u-col>
		</u-row>
		
		<u-row gutter="10" justify="around">
			<u-col span="4">
				<u-button class="button_1" @click="save_file" :disabled="!save_button" size="medium">Save</u-button>
			</u-col>
			<u-col span="4">
				<u-button class="button_1" @click="clear" :disabled="!clear_button" size="medium">Clear data</u-button>
			</u-col>
		</u-row>
		<u-toast ref="uToast" />

	</view>
</template>

<script>
	export default {
		data() {
			return {
				init_step: 0,
				step_list:[],
				local_x: [],
				local_y: [],
				local_z: [],
				local_time: [],
				user_id: '',
				start_button: true,
				end_button: false,
				save_button: false,
				clear_button: true,
				user : {},
				wid :'',
				golbal_event:{
					step:''
				}
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
				console.log(this.local_z)
				console.log(this.local_time)
				
				// 关闭监听器
				plus.accelerometer.clearWatch( this.wid )
			},
			clear() {
				this.$refs.uToast.show({
									title: 'Successfully clear cache',
									type: 'success'
								})
				// clear cache
				this.local_x = []
				this.local_y = []
				this.local_z = []
				this.local_time = []
				this.step_list = []
				this.init_step = 0
				this.interval_cache = 0
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
				this.wid = plus.accelerometer.watchAcceleration( function ( a ) {
					self.local_x.push(a.xAxis)
					self.local_y.push(a.yAxis)
					self.local_z.push(a.zAxis)
					// 计入步数 
					if(step_time_cache < 60000){
						step_time_cache = step_time_cache + milisec
						self.step_list.push( "" )
					}else{
					
						self.golbal_event.step.getCurrentTimeSportStep(function(n) {
							self.step_list.push( n - self.init_step )
							console.log('走了'+n+'步');
							self.init_step = n
						})
						step_time_cache = 0
					}
					
					// 计入时间
					myDate.setMilliseconds(myDate.getMilliseconds()+milisec)
					self.local_time.push("" + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds() + ":" + myDate.getMilliseconds())
				}, function ( e ) {
					plus.nativeUI.alert("watchAcceleration error: " + JSON.stringify(e)); 
				}, {frequency:milisec}); // 设置更新间隔时间为 milisec ms
				
				
				
				
				
				// this.inerval_id = setInterval(() => {
					
				// 	console.log('Interval is running')
					
				// 	plus.accelerometer.getCurrentAcceleration(function(a) {
				// 		console.log('x data is ' + a.xAxis)
				// 		self.local_x.push(a.xAxis)
				// 		self.local_y.push(a.yAxis)
				// 		self.local_z.push(a.zAxis)
				// 	})
					
				// 	step.getCurrentTimeSportStep(function(n) {
				// 		self.step_list.push( n - self.init_step )
				// 		console.log('走了'+n+'步');
				// 		self.init_step = n
				// 	})
				// 	self.local_time.push("")
					
				// 	// if(sec === 60000){
				// 	// 	// 计步器 60s 的情况
				// 	// 	step.getCurrentTimeSportStep(function(n) {
				// 	// 		self.step_list.push( n - self.init_step )
				// 	// 		console.log('走了'+n+'步');
				// 	// 		self.init_step = n
				// 	// 	})
				// 	// 	// 每次导入数据的时候物理性+1s 时间属性
				// 	// 	myDate.setSeconds(myDate.getSeconds()+60)
				// 	// 	self.local_time.push("" + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds())
				// 	// 	console.log('now time is ' + self.local_time[self.local_time.length-1])
						
				// 	// }else if( sec === 30000){
				// 	// 	// 30 秒的情况
				// 	// 	// 每次导入数据的时候物理性+1s 时间属性
				// 	// 	myDate.setSeconds(myDate.getSeconds()+30)
				// 	// 	self.local_time.push("" + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds())
				// 	// 	console.log('now time is ' + self.local_time[self.local_time.length-1])
						
				// 	// 	if(Math.round(self.interval_cache % 60) === 0){
				// 	// 		step.getCurrentTimeSportStep(function(n) {
				// 	// 			self.step_list.push( n - self.init_step  )
				// 	// 			console.log('走了'+n+'步');
				// 	// 			self.init_step = n
				// 	// 		})
				// 	// 		self.interval_cache = self.interval_cache + 30
				// 	// 	}else{
				// 	// 		self.step_list.push( '' )
				// 	// 		self.interval_cache = self.interval_cache + 30
				// 	// 	}
				// 	// }else{
				// 	// 	// 每次导入数据的时候物理性+1s 时间属性
				// 	// 	myDate.setSeconds(myDate.getSeconds()+1)
				// 	// 	self.local_time.push("" + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds())
				// 	// 	console.log('now time is ' + self.local_time[self.local_time.length-1])
						
				// 	// 	// 1 秒的情况
				// 	// 	if(Math.round(self.interval_cache % 60) === 0){
				// 	// 		step.getCurrentTimeSportStep(function(n) {
				// 	// 			self.step_list.push( n - self.init_step  )
				// 	// 			console.log('走了'+n+'步');
				// 	// 			self.init_step = n
				// 	// 		})
				// 	// 		self.interval_cache = self.interval_cache + 1
				// 	// 	}else{
				// 	// 		self.step_list.push( '' )
				// 	// 		self.interval_cache = self.interval_cache + 1
				// 	// 	}
				// 	// }
				// 	// console.log("========" + self.step_list)
					
					
				// }, parseInt(sec))
				
				
			},
			save_file() {
				// 表头
				var header = "" + "userName" + "," + "Student number" + ","+"Age" + ","+ "Gender" +"," + "Weight"+"," + "Height"+ "\r\n"
				var acc_file = header + "" + this.user_id + ","+ this.user.student_number +","+ this.user.age +"," + this.user.sex +"," +this.user.weight+","+this.user.height+"\r\n" + "y,x,z,steps/Minute,time\r\n"
				// 时间节点
				var myDate = new Date()
				var now_time = "" + myDate.getMonth() + "-" + myDate.getDate() + "-" + myDate.getHours() + "-" + myDate.getMinutes()
				// 循环赋值，生成csv格式的文件
				for (var i = 0; i < this.local_time.length; i++) {
					acc_file += this.local_y[i] + "," + this.local_x[i] + "," + this.local_z[i] + ","+ this.step_list[i] + ","+ this.local_time[i] + "\r\n"
				}
				const self = this
				console.log(plus.io.PUBLIC_DOCUMENTS)
				plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, function(fs) {
					// fs.root是根目录操作对象DirectoryEntry
					fs.root.getFile('acceleration' + '-' + self.user_id + "-" + now_time + '.csv', {
						create: true
					}, function(fileEntry) {
						fileEntry.file(function(file) {
							// create a FileWriter to write to the file
							fileEntry.createWriter(function(writer) {
								// Write data to file.
								// 快速将文件指针转发到文件末尾
								writer.seek(file.size - 1)
								writer.write(acc_file)
							}, function(e) {
								console.log("Request file system failed: " + e.message)
							})
						})
					})
					
				})
				this.$refs.uToast.show({
									title: 'Successfully saved',
									type: 'success'
								})
				console.log("writed")
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
