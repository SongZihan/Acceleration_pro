export function add_a_row(x,y,z,step,myDate,milisec){
	
	myDate.setMilliseconds(myDate.getMilliseconds()+milisec)
	var time = "" + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds() + ":" + myDate.getMilliseconds()
	
	// 返回一个整理好的逗号分隔的一行数据
	return '' + x + ',' + y + ',' + z +','+ step + ',' + time + '\r\n'
}


// 异步存储键值
export function setStorageAsync(key,data) {
	var length = data.length()
	plus.storage.setItemAsync(key, data, function(){
		console.log("setItemAsync success")
		
	}, function(e){
		console.log("setItemAsync failed: "+JSON.stringify(e));
	});
}

// 获取当前日期 xxxx-xx-xx
export function now_date(){
	// 获取当前日期
	var date = new Date();
	
	// 获取当前月份
	var nowMonth = date.getMonth() + 1;
	
	// 获取当前是几号
	var strDate = date.getDate();
	
	// 添加分隔符“-”
	var seperator = "-";
	
	// 对月份进行处理，1-9月在前面添加一个“0”
	if (nowMonth >= 1 && nowMonth <= 9) {
	   nowMonth = "0" + nowMonth;
	}
	
	// 对日期进行处理，1-9号在前面添加一个“0”
	if (strDate >= 0 && strDate <= 9) {
	   strDate = "0" + strDate;
	}
	
	// 最后拼接字符串，得到一个格式为(yyyy-MM-dd)的日期
	var nowDate = date.getFullYear() + seperator + nowMonth + seperator + strDate;
	return nowDate
}


// export function file_writer(user_id,now_time,acc_file){
// 	plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, function(fs) {
// 		// fs.root是根目录操作对象DirectoryEntry
// 		fs.root.getFile('acceleration' + '-' + user_id + "-" + now_time + '.csv', {
// 			create: true
// 		}, function(fileEntry) {
// 			fileEntry.file(function(file) {
// 				// create a FileWriter to write to the file
// 				fileEntry.createWriter(function(writer) {
// 					// Write data to file.
// 					// 快速将文件指针转发到文件末尾
// 					writer.seek(file.size - 1)
// 					writer.write(acc_file)
// 				}, function(e) {
// 					console.log("Request file system failed: " + e.message)
// 				})
// 			})
// 		})
		
// 	})
// }


export function get_files(acc_file,user_id,date,self){

	// 组装csv文件
	var keys = plus.storage.getAllKeys()
	console.log(keys)
	// 过滤选择的列表并按照时间戳排序 
	keys = keys.filter(item => item.slice(0,13) === 'HAcceleration' && item.split('/')[1] === user_id && item.split('/')[3] === date )
	// 如果选择的日期没有数据
	if(keys.length === 0){
		self.$refs.uToast.show({
							title: 'Selected date not exist!',
							type: 'error'
						})
	}
	
	
	// 构造排序条件函数
	function fn_sort(x,y){
		return parseInt(x.split('/').pop()) - parseInt(y.split('/').pop())
	}
	var sorted_keys = keys.sort(fn_sort)
	// 获取数据构造csv
	for(var k in sorted_keys){
		acc_file += plus.storage.getItem(sorted_keys[k])
	}
	return acc_file
}

export function file_writer(user_name,data,header){
	// user_name 用户名，用来创建文件夹
	// data 文件对象 字符串格式
	// header 如果文件的长度为0则自动添加文件头
	
	// 获取当前时间
	var date = now_date()
	// 组装文件名
	var file_name = date + '.csv'
	
	plus.io.resolveLocalFileSystemURL('_documents', function(entry) {
		// 创建文件夹,如果不存在的话
		entry.getDirectory(user_name,{create:true,exclusive:false},function(entry_success){
			// 获取对应文件名的文件对象，如果没有就创建
			entry_success.getFile(file_name,{create:true},
			 function(file_entry){
				 // 这里也有一层回调函数
				 file_entry.file(function(file){
					    // 创建文件读取器
						var fileWriter = file_entry.createWriter(function(writer){
							
							writer.seek(file.size - 1)
							// 如果文件的长度为0则自动添加文件头
							if(file.size === 0){
								writer.write(header)
								writer.write(data)
							}else{
								// 向文件中写入一些实体,将文件指针调到文件末尾
								writer.write(data)
							}
							
					})
				},function(e) {
						console.log("Request file system failed: " + e.message)
				})
			},function(e){
				console.log('failed' + e)
			})
			
		},function(entry_fail){
			console.log('Failed get diretory')
		})
	})
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}