const { crossOriginOpenerPolicy, crossOriginResourcePolicy, originAgentCluster } = require("helmet");

const helmetConfig={
    contentSecurityPolicy:{
        directives:{
            //by default, only allow resources from same origin if no setting
            defaultSrc:["'self'"],
            scriptSrc:[
                // allow script from same origin
                "'self'",  
                //allow execution of inline script
                "'unsafe-inline'",            
                //the following is the domain that allow to run script from
                "code.jquery.com",            
                "cdn.datatables.net",
                "cdn.jsdelivr.net"
            ],
            scriptSrcAttr:[
                //not secure, but suitable for local area network env
                "'unsafe-inline'"  
            ],
            styleSrc:[
                //allow style from same origin
                "'self'",
                //allow execution of inline style  
                "'unsafe-inline'",        
                //the following is the domain that allow to run style from
                "code.jquery.com",            
                "cdn.datatables.net",
                "cdn.jsdelivr.net"
            ],
            imgSrc:[
                /* allow image from 
                    -same origin
                    -data URL
                    -any https
                    -Binary Large Object, e.g.: URL.createObjectURL(file)
                */
                "'self'",
                "data:",
                "https:",
                "blob:"
            ],
            //allow Ajax/WebSocket/fetch from ...
            connectSrc:["'self'"],
            //allow font from ...
            fontSrc:[
                "'self'",
                "cdn.jsdelivr.net"
            ],
            //block all <object>, <embed> and <applet> elements, these are old elements
            objectSrc:["'none'"],
            //which sites can embed your page
            frameAncestors:["'self'"],   
            //which URLs can be loaded into frames
            frameSrc:["'self'","http://localhost:*","https://localhost:*",'chrome://*','data:','about:','chrome-error://*','chrome-extension://*'],
            //prevent atttackers from manipulating relative URLs through <base> tag 
            baseUri:["'self'"],
            // only submit data to authorized domains
            formAction:["'self'","http://localhost:*","https://localhost:*"]
        }
    },
    //COEP, If true, all the resource need to have proper CORS/CORP headers. 
    crossOriginEmbedderPolicy:false,
    //COOP, Control window opener behavior (e.g. window.open(site))
    crossOriginOpenerPolicy:{policy:'same-origin-allow-popups'},
    //CORP, act as gateway. However, not all browsers fully enforce CORP, therefore, set it to cross-origin to allow external resources and let CSP to handle
    crossOriginResourcePolicy:{policy:'cross-origin'},
    //this system is same origin, can ignore originAgentCluster
    originAgentCluster:true,

}

module.exports=helmetConfig;