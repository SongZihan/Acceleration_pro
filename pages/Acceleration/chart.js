export function get_acceleration_data(){
					uni.startAccelerometer({
						interval:"game",
						success: (res) => {
							console.log('getted data')
							uni.stopAccelerometer()
						}
					})
				}