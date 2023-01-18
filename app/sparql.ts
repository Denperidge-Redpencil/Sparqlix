import { MatrixClient } from "matrix-bot-sdk";
import { logError } from "matrix-bot-starter";
import { default as SparqlClient } from 'sparql-http-client';

let incomingData : 
    {[requestEventId: string]: {
        headers: Set<string>,
        data: string,
        timeout?: NodeJS.Timeout
    }} = {};

function streamDataToTdString(streamData: any, headers : Set<string>) {
    if (typeof(streamData) == 'object') {
        const entries : [string, any][] = Object.entries(streamData); 

        
        let tds = '';
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const key = entry[0];
            const value = entry[1];


            // Don't add non-requested data
            if (!headers.has(key) && key != 'value') { continue; }

            tds += streamDataToTdString(value, headers);
            
        }
        return tds;

            
    } else {
        return `<td>${streamData}</td>`
    }
}

export async function handleSparqlCodeblocks(client: MatrixClient, roomId : string, requestEventId : string, event : any, body : string, isEdit : Boolean) {
    const firstNewLine : number = body.indexOf('\n');
    const endpointUrl : string = body.substring(0, firstNewLine).trim();
    const query : string = body.substring(firstNewLine).trim();

    incomingData[requestEventId] = {headers: new Set(), data: ''};
    client.replyNotice(roomId, event, 'Running SPARQL Query...');

    try { 
        const sparqlClient = new SparqlClient({endpointUrl});
        const stream = await sparqlClient.query.select(query);

        stream.on('error', (err) => {
            logError(err, client, roomId);
        });
    
        stream.on('readable', function(this: any) {
            let data : string = '';
            //let headers : Set<string> ;
            let streamData : Array<Array<any>>;

            while ((streamData = this.read()) !== null) {
                if (incomingData[requestEventId].headers.size <= 0) {
                    // Setup table headers
                    Object.entries(streamData).forEach((value: Array<any>) => {
                        incomingData[requestEventId].headers.add(value[0]);
                    });
                }
                
                
                
                data += '<tr>';
                data += streamDataToTdString(streamData, incomingData[requestEventId].headers);
                data += '</tr>'

                incomingData[requestEventId].data += data;


                if (incomingData[requestEventId].timeout != null) {
                    clearTimeout(incomingData[requestEventId].timeout);
                }
                incomingData[requestEventId].timeout = setTimeout(()=> {
                    let thisIncomingData = incomingData[requestEventId];
                    delete incomingData[requestEventId];
                    let headersHtml = '';
                    Array.from(thisIncomingData.headers).forEach((value, index) => {
                        headersHtml += `<th>${value}</th>`;
                    });

                        
                    data = `<table><tr>${headersHtml}</tr>${thisIncomingData.data}`;
                    data += `</table>`;

                    client.replyHtmlText(roomId, event, thisIncomingData.data);
                }, 2500);
                
                


            }
            if (data == '') {
                // If there were no headers set, there was no data
                return;
            }

             /*
            let headersHtml = '';
            Array.from(headers).forEach((value, index) => {
                headersHtml += `<th>${value}</th>`;
            });

            
            
           
            data = `<table><tr>${headersHtml}</tr>${data}`;
            data += `</table>`;

            client.replyHtmlText(roomId, event, data);
            */
        });
    } catch (err) {
        logError(err, client, roomId);
    }
    
}