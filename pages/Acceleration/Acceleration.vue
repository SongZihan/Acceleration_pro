<template>
	<view>
		<u-row gutter="10" justify="center" class="first_line">
			<u-col span="1">
				X:
			</u-col>
			<u-col span="10">
				<u-line-progress class="progress_line" :striped="true" :percent="Math.abs(local_x/10 * 100)" :striped-active="true"
				 :show-percent="false"></u-line-progress>
			</u-col>
		</u-row>
		<u-row gutter="10" justify="center">
			<u-col span="1">
				Y:
			</u-col>
			<u-col span="10">
				<u-line-progress class="progress_line" :striped="true" :percent="Math.abs(local_y/10 * 100)" :striped-active="true"
				 :show-percent="false"></u-line-progress>
			</u-col>
		</u-row>
		<u-row gutter="10" justify="center" class="last_line">
			<u-col span="1">
				Z:
			</u-col>
			<u-col span="10">
				<u-line-progress class="progress_line" :striped="true" :percent="Math.abs(local_z/10 * 100)" :striped-active="true"
				 :show-percent="false"></u-line-progress>
			</u-col>
		</u-row>

		<u-row gutter="10" justify="center" class="first_line">
			<u-col span="4">
				x: {{x}}
			</u-col>
			<u-col span="4">
				y: {{y}}
			</u-col>
			<u-col span="4">
				z: {{z}}
			</u-col>
		</u-row>

		<u-row>
			<u-col>
				<scroll-view :scroll-top="scrollTop" scroll-y="true" class="scroll-Y">
					<p>{{logPlace}}</p>
				</scroll-view>
			</u-col>
		</u-row>


		<u-row gutter="10" justify="around">
			<u-col span="4">
				<u-button class="button_1" @click="connect_device" :type="connectStatus" :disabled="startButton">{{connectText}}</u-button>
			</u-col>
			<u-col span="4">
				<u-button class="button_1" type="info" @click="save_data" :disabled="stopButton">Stop and Save</u-button>
			</u-col>
		</u-row>
		<u-row gutter="10" justify="center">
			<!-- <u-col span="4">
				<u-button class="button_1" @click="start_listen(60000)" :disabled="!start_button" size="medium">Start 60 second</u-button>
			</u-col> -->
			<u-col span="4">
				pressure_data: {{pressure_data}}
			</u-col>
			<!-- <u-col span="4">
				<u-button class="button_1" @click="test_diretory"  size="medium">test_diretory</u-button>
			</u-col> -->
		</u-row>
		<u-row gutter="10" justify="around">
			<!-- <u-col span="4">
				<u-button class="button_1" @click="start_listen(60000)" :disabled="!start_button" size="medium">Start 60 second</u-button>
			</u-col> -->
			<u-col span="4">
				<u-button class="button_1" @click="stop_listen" :disabled="!end_button" size="medium">Stop listen</u-button>
			</u-col>
			<u-col span="4">
				<u-button class="button_1" type="info" @click="test">Test</u-button>
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
				<u-button class="button_1" @click="start_listen(100)" :disabled="!start_button" size="medium">Start 10 hz</u-button>
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
		</u-row>
		<u-toast ref="uToast" />

	</view>
</template>

<script>
	import {
		add_a_row,
		add_a_row_orientation,
		now_date,
		file_writer,
		get_files,
		sleep,
		add_a_row_orientation_without_position
	} from './helper.js'
	import * as helper from './BLE_helper.js'
	import {
		log_this
	} from './time_helper.js'
	import {
		BLE_file_writer
	} from './file_helper.js'

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
				user: {},
				wid: '',
				orientation_wid: '',
				golbal_event: {
					step: ''
				},
				// 日历
				show: false,
				// 单一日期模式
				date: 'date',
				// 用于展示的date
				selected_date: 'Select date',
				// 数据缓存
				data_cache: '',
				orientation_cache: '',
				orientation_header_file: '',
				acceleration_header_file: '',
				// 数据抽取间隔
				time_type: '',
				// 陀螺仪数据
				x: '',
				y: '',
				z: '',
				/*
				蓝牙相关数据
				*/
				// DeviceId: "3C:A5:49:DE:83:BE",
				DeviceId: "3C:A5:4A:E4:06:18",
				serviceId: '0000FFE0-0000-1000-8000-00805F9B34FB',
				characteristicId: "0000FFE1-0000-1000-8000-00805F9B34FB",
				// log模块
				logPlace: '',
				// 用户信息
				userInfo: {
					username: "Song Zihan",
					header: "data1,data2,time\r\n",
					file_type: "Pressure",
				},
				// 数据
				data: '',
				// 表示连接状态
				connectStatus: 'primary',
				// 表示按钮文字
				connectText: 'Connect Device',
				// 停止按钮的状态
				stopButton: true,
				startButton: false,
				// 滚动条
				scrollTop: 0,
				// 校准时间的全局变量
				thresholds: 0,
				pressure_data: ''

			}
		},
		onLoad: function(option) {
			this.user_id = option.user_name
			uni.getStorage({
				key: this.user_id,
				success: (res) => {
					this.user = res.data;
				}
			})
			// 蓝牙模块
			helper.openBluetoothAdapter(this).then((e) => {
				helper.startDicoverDevices(this).then(e => {
					helper.foundNewDevice(this)
				})
			})
		},
		mounted() {
			var self = this
			// 计步器
			// 注册计步器
			var step = uni.requireNativePlugin('DC-StepCounter');
			// 注册globalEvent
			var globalEvent = uni.requireNativePlugin('globalEvent');
			// 计步器
			// 监听globalEvent事件 StepCounter_Ready 在ready后调用计步器相关API
			globalEvent.addEventListener("StepCounter_Ready", function(e) {
				step.getCurrentTimeSportStep(function(n) {
					self.init_step = n
					console.log('init step is ---', n)
				})
			});
			//调用初始化 先注册StepCounter_Ready事件 再调用initialize初始化 防止StepCounter_Ready事件丢失
			step.initialize()
			// 绑定data变量以在其他方法中调用
			this.golbal_event.step = step

			// 注册保活程序
			const hgService = uni.requireNativePlugin("HG-Background");
			hgService.config({
				title: "HAcceleration Service",
				content: "Now Running",
				mode: 0, //0省电模式 1流氓模式
			})
			// 打开安全管理
			hgService.showSafeSetting()
			// 检测是否限制后台运行
			var result = hgService.checkIfLimited()
			console.log(result)
			// 申请后台运行
			hgService.requestIgnoreLimit()
			// 启动前台服务
			hgService.startService()

		},
		beforeDestroy() {
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
				plus.accelerometer.clearWatch(this.wid)


				// 当用户点击stop的时候将内存中的数据存入文件
				file_writer(this.user_id, this.data_cache, this.acceleration_header_file, 'acceleration', this.time_type)

				file_writer(this.user_id, this.orientation_cache, this.orientation_header_file, 'orientation', this.time_type)

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

				// this.$refs.uToast.show({
				// 	title: 'start listen~',
				// 	type: 'success'
				// })
				this.end_button = true
				this.start_button = false
				const self = this
				// 首先获取开始时间
				var myDate = new Date()
				// 时间阈值
				var time_thresold = 0
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
				var header = "" + "userName" + "," + "Student number" + "," + "Age" + "," + "Gender" + "," + "Weight" + "," +
					"Height" + "\r\n"
				this.acceleration_header_file = header + "" + this.user_id + "," + this.user.student_number + "," + this.user.age +
					"," + this.user.sex + "," + this.user.weight + "," + this.user.height + "\r\n" +
					"y,x,z,magnitude,steps/Minute,time\r\n"
				this.orientation_header_file = header + "" + this.user_id + "," + this.user.student_number + "," + this.user.age +
					"," + this.user.sex + "," + this.user.weight + "," + this.user.height + "\r\n" +
					"x,y,z,time\r\n"

				// 抽取时间的间隔
				if (milisec === 33) {
					this.time_type = '30hz'
				} else if (milisec === 60000) {
					this.time_type = '60s'
				} else if (milisec === 10) {
					this.time_type = '100HZ'
				} else if (milisec === 100) {
					this.time_type = '10hz'
				}

				// 使用watch 监听设备加速度变化
				this.wid = plus.accelerometer.watchAcceleration(function(a) {
					// 更新显示
					self.local_x = a.xAxis
					self.local_y = a.yAxis
					self.local_z = a.zAxis
					// 更新时间阈值
					if (time_thresold > 5000) {
						myDate = new Date()
						time_thresold = 0
					} else {
						time_thresold += 33
					}
					// 计入步数 
					if (step_time_cache < 60000) {
						step_time_cache += milisec
						// 拼接字符串
						self.data_cache += add_a_row(a.xAxis, a.yAxis, a.zAxis, '', myDate, milisec)
					} else {

						self.golbal_event.step.getCurrentTimeSportStep(function(n) {
							// 计算一分钟内的所有步数
							var step_per_minute = n - self.init_step
							// 拼接字符串
							self.data_cache += add_a_row(a.xAxis, a.yAxis, a.zAxis, step_per_minute, myDate, milisec)
							self.init_step = n
						})
						// 必须计入本次的循环时间
						step_time_cache = milisec
					}


					// 数据存储
					if (self.data_cache.length >= 800000) {
						// 当字符串长度大于1000000时，也就是存储大于60kb时
						var storage_data = self.data_cache // 设置存储副本
						self.data_cache = '' // 清空缓存
						file_writer(self.user_id, storage_data, self.acceleration_header_file, 'acceleration', self.time_type)
					}

				}, function(e) {
					plus.nativeUI.alert("watchAcceleration error: " + JSON.stringify(e));
				}, {
					frequency: milisec
				}); // 设置更新间隔时间为 milisec ms


				// 将方向传感器改成角速度传感器


			},
			//测试NJS
			test() {
				var activity = plus.android.runtimeMainActivity();
				var Sensor = plus.android.importClass("android.hardware.Sensor");
				var SensorManager = plus.android.importClass("android.hardware.SensorManager");
				var Context = plus.android.importClass("android.content.Context");

				var mSensorManager = activity.getSystemService(Context.SENSOR_SERVICE);
				var mgyroscope = mSensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE);
				var listener = plus.android.implements("android.hardware.SensorEventListener", {
					onAccuracyChanged: function(sensor, accuracy) {

					},
					onSensorChanged: function(event) {
						console.log("传感器类型：" + event.plusGetAttribute("sensor").getType());
						console.log("当前值" + event.plusGetAttribute("values"));
					}
				});
				// mSensorManager.unregisterListener(listener);

				// mSensorManager.registerListener(listener, mStepDetector, SensorManager.SENSOR_DELAY_FASTEST);  
				mSensorManager.registerListener(listener, mgyroscope, SensorManager.SENSOR_DELAY_FASTEST);
			},

			// 蓝牙方法
			connect_device() {
				// 连接设备
				helper.connectDevice(this, this.DeviceId).then((e) => {
					helper.notifyBLECharacteristicValueChange(
						this,
						this.DeviceId,
						this.serviceId,
						this.characteristicId
					)
					// 订阅成功，改变按钮状态
					this.connectStatus = 'success'
					this.connectText = 'Connected'
					this.stopButton = false
					this.startButton = true
					// 发送消息
					this.$refs.uToast.show({
						title: 'Successfully connected~',
						type: 'success'
					})
				}).catch(e => {
					// 发送消息
					this.$refs.uToast.show({
						title: 'connect failed',
						type: 'error'
					})
				}).finally((e) => {
					// 关闭设备搜寻
					helper.stopBluetoothDiscovery(this)
				})
			},
			save_data() {
				var data_cache = this.data
				BLE_file_writer(this,
					this.user_id,
					data_cache,
					this.userInfo.header,
					this.userInfo.file_type)
				this.data = ''
				// 更改按钮状态
				this.stopButton = true
				this.startButton = false
				// 关闭蓝牙连接，停止监听数据
				helper.closeConnection(this, this.DeviceId)
			}

		},
		onUnload() {
			// 卸载页面之后关闭各种蓝牙接口
			helper.stopBluetoothDiscovery(this).finally((e) => {
				helper.closeBluetoothAdapter(this)
			})
		}
	}
</script>

<style scoped>
	.progress_line {
		margin: 20px 0;
	}

	.button_1 {
		width: 250rpx;
		margin: 20px 0;
	}

	.first_line {
		margin-top: 10px;
	}

	.last_line {
		margin-bottom: 10px;
	}

	p {
		white-space: pre-wrap;
	}

	.scroll-Y {
		height: 400rpx;
		background-color: #FCBD71;
	}
</style>
