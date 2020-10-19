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
				local_x: [],
				local_y: [],
				local_z: [],
				local_time: [],
				inerval_id: '',
				user_id: '',
				start_button: true,
				end_button: false,
				save_button: false,
				clear_button: true,
				user : {}
			}
		},
		onLoad: function(option) {
			this.user_id = option.user_name
			uni.getStorage({
				key: this.user_id,
				success: (res)=>{
					this.user = res.data;
				}
			})
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
			},
			start_listen(sec) {
				this.$refs.uToast.show({
									title: 'start listen~',
									type: 'success'
								})
				this.end_button = true
				this.start_button = false
				this.save_button = false
				const self = this
				this.inerval_id = setInterval(() => {
					plus.accelerometer.getCurrentAcceleration(function(a) {
						var myDate = new Date()
						self.local_time.push("" + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds())
						self.local_x.push(a.xAxis)
						self.local_y.push(a.yAxis)
						self.local_z.push(a.zAxis)
					})
				}, parseInt(sec))
			},
			save_file() {
				// 表头
				var header = "" + "userName" + "," + "major" + "," + "number" + "," + "sex" + "\r\n"
				var acc_file = header + "" + this.user_id +"," + this.user.intro + ","+ this.user.student_number +"," + this.user.sex + "\r\n" + "x,y,z,time\r\n"
				// 时间节点
				var myDate = new Date()
				var now_time = "" + myDate.getMonth() + "-" + myDate.getDate() + "-" + myDate.getHours() + "-" + myDate.getMinutes()
				// 循环赋值，生成csv格式的文件
				for (var i = 0; i < this.local_time.length; i++) {
					acc_file += this.local_x[i] + "," + this.local_y[i] + "," + this.local_z[i] + "," + this.local_time[i] + "\r\n"
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
