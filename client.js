const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader")

const packageDef = protoLoader.loadSync("runtime.proto", {});

const grpcObject = grpc.loadPackageDefinition(packageDef)

const runtimePackage = grpcObject.runtimePackage;

const client = new runtimePackage.RuntimeService("localhost:40000", grpc.credentials.createInsecure())

const method = process.argv[2]; // specifies which method is being called upon
const param = process.argv[3]; //could be config for RunPodSandbox or id for StopPodSandbox

switch (method) {
    case "run":
        client.RunPodSandbox({"config": param}, (err, response) => {
            console.log( "Pod running: ", JSON.stringify(response.pod))
        });
        break;
    case "stop":
        client.StopPodSandbox({"id": param}, (err, response) => {
            console.log(JSON.stringify(response.message));
        });
        break;
    default:
        const call = client.ListPodSandbox()
        call.on("data", response => {
            console.log("Received pod from server: ", JSON.stringify(response.pod));
        });
        call.on("end", e => console.log("Server done!"));
        break;
}
