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
            childSrc: ["'self'","http://localhost:*","https://localhost:*"],
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

    /*
    no-referrer: No referrer will be sent
    strict-origin-when-cross-origin: Full URL for same-origin, origin only for cross-origin
    referrer is used to indicate the source URL from which a request originated
    */
    referrerPolicy:{
        policy:['no-referrer','strict-origin-when-cross-origin']
    },
    /*
    while user type domain of the website to search,
    the broswer would checks HSTS status and automatically uses: https if set hsts.
    otherwise, it may go to http and attacker can intercept this request.
    */
    hsts:{
        maxAge:31536000,    //browser will enforce https for 1 years
        includeSubDomains:true,  //if subdomain is same, http= > https
        preload:true      //example.com => https: since domain in browser perload list
    }

}

module.exports=helmetConfig;