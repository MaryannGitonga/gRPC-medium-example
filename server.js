const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader")
const packageDef = protoLoader.loadSync("runtime.proto", {});

const grpcObject = grpc.loadPackageDefinition(packageDef)

const runtimePackage = grpcObject.runtimePackage;

const PodStatus = runtimePackage.PodStatus;

const server = new grpc.Server();
server.bindAsync("0.0.0.0:40000", grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err != null) {
      console.error(err);
      return;
    }
    server.start();
    console.log(`gRPC server started on port ${port}`);
  });

server.addService(runtimePackage.RuntimeService.service,
    { 
        "RunPodSandbox": RunPodSandbox,
        "StopPodSandbox": StopPodSandbox,
        "ListPodSandbox": ListPodSandbox,
    });

const podSandboxes = []

function RunPodSandbox (call, callback) {
    const podSandbox = {
        "id": podSandboxes.length + 1,
        "config": call.request.config,
        "status": PodStatus.type.value[1].name
    }
    podSandboxes.push(podSandbox);


    callback(null, {"pod": podSandbox});
}
function StopPodSandbox (call, callback) {
    try {
        const podSandbox = podSandboxes.find(pod => pod.id === call.request.id);
        if (podSandbox.status === "STOPPED"){
            callback(null, {"message": `Pod of id ${call.request.id} is already in stopped state.`}) 
        }
        else{
            podSandbox.status = PodStatus.type.value[0].name;
            callback(null, {"message": `Pod of id ${call.request.id} is stopped.`}) 
        } 
    } catch (error) {
        callback(null, {"message": `There is no pod with id: ${call.request.id}`});
    }
}

function ListPodSandbox(call, callback){
    podSandboxes.forEach(podSandbox => call.write({"pod": podSandbox}));
    call.end();
} 