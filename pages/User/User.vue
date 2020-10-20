<template>
	<view class="warp">
		<u-row>
			<u-col>
				<h2>Please enter your infomation</h2>
			</u-col>
		</u-row>
		<u-row>
			<u-col>
				<u-form :model="form" ref="uForm">
					<u-form-item label="name">
						<u-input v-model="form.name" placeholder="Please enter context" />
					</u-form-item>
					<u-form-item label="Height">
						<u-input v-model="form.height" placeholder="Please enter context" />
					</u-form-item>
					<u-form-item label="Age">
						<u-input v-model="form.age" placeholder="Please enter context" />
					</u-form-item>
					<u-form-item label="Weight">
						<u-input v-model="form.weight" placeholder="Please enter context" />
					</u-form-item>
					<u-form-item label="Student ID">
						<u-input v-model="form.student_number" placeholder="Please enter context" />
					</u-form-item>
					<u-form-item label="Gender">
						<u-radio-group v-model="form.sex">
							<u-radio v-for="(item, index) in radioList" :key="index" :name="item.name" :disabled="item.disabled">
								{{ item.name }}
							</u-radio>
						</u-radio-group>
					</u-form-item>
				</u-form>
			</u-col>
		</u-row>
		<u-row justify="center">
			<u-col span="4">
				<u-button @click="submit" type="success" size="medium" style="margin: 40px 0;">Submit</u-button>
			</u-col>
		</u-row>
		<u-toast ref="uToast" />


		<u-row>
			<u-col>
				<u-divider style="margin: 40px 0;">등록된 User</u-divider>
				<u-swipe-action :show="item.show" :index="index" v-for="(item, index) in list" :key="item.id" @click="click_delete"
				  @content-click="click_content" :options="options">
					<view class="item u-border-bottom">
						<image mode="aspectFill" :src="item.images" />
						<!-- 此层wrap在此为必写的，否则可能会出现标题定位错误 -->
						<view class="title-wrap">
							<text class="title u-line-2">{{ item.title }}</text>
						</view>
					</view>
				</u-swipe-action>
			</u-col>
		</u-row>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				form: {
					name: '',
					gender: '',
					sex: '',
					student_number: '',
					weight:'',
					height:'',
					age:''
				},
				radioList: [{
						name: 'man',
						disabled: false
					},
					{
						name: 'woman',
						disabled: false
					}
				],
				user_list: [],

				list: [],
				disabled: false,
				btnWidth: 180,
				show: false,
				options: [{
					text: '삭제',
					style: {
						backgroundColor: '#dd524d'
					}
				}]
			};
		},
		onShow: function() {
			const res = uni.getStorageInfoSync()
			this.user_list = res.keys
			console.log(this.user_list)
			this.list = []
			for (var i = 0; i < this.user_list.length; i++) {
				this.list.push({
					id: i,
					title: this.user_list[i],
					show: false
				})
			}
		},
		methods: {
			click_delete(index, index1) {
				uni.removeStorage({
					key: this.list[index].title,
					success: function(res) {
						console.log('success delete from storage');
					}
				})
				this.list.splice(index, 1)
				this.$u.toast(`Successfully delete item`)

				console.log('delete button has been click! it is ' + index)
			},
			click_content(index) {
				console.log('button ' + index + 'has been click')
				uni.navigateTo({
					url: '../Acceleration/Acceleration?user_name=' + this.list[index].title
				})
			},
			submit() {
				if (this.form.name === null || this.form.name.length < 2) {
					this.$refs.uToast.show({
						title: 'Please enter name!',
						// 如果不传此type参数，默认为default，也可以手动写上 type: 'default'
						type: 'warning',
					})
				} else {
					uni.setStorage({
						key: this.form.name,
						data: {
							'age': this.form.age,
							'height': this.form.height,
							'weight': this.form.weight,
							'sex': this.form.sex,
							'student_number': this.form.student_number
						},
						success: function() {
							console.log('success');
						}
					})
					uni.navigateTo({
						url: '../Acceleration/Acceleration?user_name=' + this.form.name
					})
				}
			},
			get_data() {
				uni.getStorage({
					key: this.form.name,
					success: function(res) {
						console.log(res.data);
					}
				})
			},
			get_list() {
				uni.getStorageInfo({
					success: function(res) {
						console.log((res.keys))
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.item {
		display: flex;
		padding: 20rpx;
	}

	image {
		width: 50rpx;
		flex: 0 0 50rpx;
		height: 120rpx;
		margin-right: 20rpx;
		border-radius: 12rpx;
	}

	.title {
		text-align: left;
		font-size: 28rpx;
		color: $u-content-color;
		margin-top: 20rpx;
	}
</style>
