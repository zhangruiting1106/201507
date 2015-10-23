/*
用nodejs实现的一个静态文件服务器
1. 可以通过浏览器访问
2. 根目录/代表server.js所在的目录。
3. 访问根目录时可以列出根目录下所有的文件和文件夹。
4. 点击文件夹时进入下一级目录。
5. 点击文件则显示该文件。比如是图片就显示图片，是html就显示html
*/

var http=require("http"); //引入http模块
var fs=require("fs"); //引入fs模块，进行文件读取操作
var url=require("url"); //处理url，url是一个地址，如https://www.baidu.com  scheme://host.domain:port/path/filename
/*
 统一资源定位器(Uniform Resource Locator，URL)用于描述Internet上资源的位置和访问方式。
 下面是新华网一个网页的网址： http://news.xinhuanet.com/zlft/2010-02/28/content_10918112.htm
 基本语法：scheme://host.domain:port/path/filename
 语法说明：
URL通常包括三个部分，第一部分是Scheme，告诉浏览器该如何工作，第二部分是文件所在的主机，第三部分是文件的路径和文件名。
Scheme：定义因特网服务的类型，告诉浏览器如何解析将要打开的文件内容。最流行的类型是 http。
domain（域）：定义因特网域名，比如：xinhuanet.com。
host（主机）：定义此域中的主机。如果被省略，缺省的支持 http 的主机是 www，上例中是news。
port(端口)：定义服务的端口号，端口号通常是被省略的。http默认的端口号是 80。
path（路径）：定义服务器上的路径（一个辅助的路径）。如果路径被省略，资源（文档）会被定位到网站的根目录，上例中是“zlft/2010-02/28/”。
filename（文件名）：定义文档的名称。上例中是“content_10918112.htm”。
*/
var path=require("path"); //处理文件的路径,path是url里的一部分
var mime=require("mime"); //第三方模块，处理文件的类型，通过响应的Content-Type返回
//创建一个服务,监听8080端口
http.createServer(function(request,response){
    //访问时忽略icon请求：浏览器每次发起请求，都会同时请求一次favicon.ico，需要进行处理把它忽略掉
    if(request.url=="/favicon.ico"){
        response.end("404");
        return;
    }

    //请求的文件地址标准化，需要过滤掉..之类的路径
    var reqPath=path.normalize(request.url);

    //缓存请求路径，在拼接字符串时会用
    var cachePath=reqPath;

    //获取当前文件的绝对路径
    var filePath=path.join(__dirname,reqPath);

    //判断文件是否存在
    fs.exists(filePath,function(exists){
        //文件存在
        if(exists){
            //判断是否是目录
            if(fs.statSync(filePath).isDirectory()){
                var addStr="<link rel='stylesheet' href='/public/css/index.css' />";
                addStr+="<h1>FileManager system directory</h1>";
                addStr+="<ul>";
                //遍历文件
                fs.readdir(filePath,function(err,files){
                    response.writeHead(200,{
                        "Content-Type":"text/html;charset=utf-8"
                    });
                    if(err){
                        console.log(err);
                    }else{
                        files.forEach(function(file){//循环父目录下的所有文件
                            if(path.extname(file)){//有后缀意味着是文件
                                addStr+="<li class='gray'><a href='"+path.join(cachePath,file)+"' style=''>"+file+" </a></li>";
                            }else{//没有后缀意味着是目录
                                addStr+="<li><a href='"+path.join(cachePath,file)+"' style=''>"+file+" </a></li>";
                            }
                        });
                    }
                    response.end(addStr+"</ul><p>提示：以上目录列表，蓝色是文件夹，可点击继续进入下一节</p>");
                });
            }else if(fs.statSync(filePath).isFile()){
                //当访问的是文件时，判断文件类型，并读文件
                response.writeHead(200,{
                    "Content-Type":mime.lookup(path.basename(filePath))+ ';charset=utf-8'
                });
                fs.readFile(filePath,{flag:"r"}, function (err,data) {
                    if(err){
                        response.end(err);
                    }else{
                        response.end(data);
                    }
                });
            }
        }else{
            response.writeHead(404,{
                "Content-Type":"text/html"
            });
            response.write("<span style='color:#f00'>'"+filePath+"'</span> was not found on this server");
            response.end();
        }
    })
}).listen(8080);