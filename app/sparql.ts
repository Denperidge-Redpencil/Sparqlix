import { MatrixClient } from "matrix-bot-sdk";
import { logError } from "matrix-bot-starter";
import StreamClient, { default as SparqlClient } from 'sparql-http-client';



export async function handleSparqlCodeblocks(client: MatrixClient, roomId : string, requestEventId : string, event : any, body : string, isEdit : Boolean) {
    const firstNewLine : number = body.indexOf('\n');
    const endpointUrl : string = body.substring(0, firstNewLine).trim();
    const query : string = body.substring(firstNewLine).trim();


    console.log('-----')
    console.log(endpointUrl)
    console.log('---')
    console.log(query)
    console.log('-----')

    try { 

    
        const sparqlClient = new SparqlClient({endpointUrl});
        const stream = await sparqlClient.query.select(query);
        
            //console.log(stream)
        stream.on('error', (err) => {
            logError(err);
            //client.replyHtmlText
        });
        /*
        stream.on('data', row => {
            console.log(row);
            data += `<tr>${row}</tr>`;
            //client.replyHtmlText(roomId, event, `test`)
        });
        stream.on('end' , () => {
            stream.read()
        });*/
        stream.on('readable', function(this: any) {
            console.log(Object.prototype.toString.call(this))

            let data : string = '<table>';
            let streamData : any;
            let headersSet : boolean = false;

            while ((streamData = this.read()) !== null) {
                if (!headersSet) {
                    data += '<tr>'
                    data += valueToRow(streamData, 0).replace(/td/gim, 'th');
                    data += '</tr>'
                    headersSet = true;
                }
                console.log(streamData);
                function valueToRow(value: any, index=1) {

                    if (typeof(value) == 'object') {
                        console.log('value is object');
                        const entries : [string, any][] = Object.entries(value); 
                        console.log(entries)
                        let tds = '';
                        for (let i = 0; i < entries.length; i++) {
                            tds += valueToRow(entries[i][index]);
                        }
                        return tds;

                            
                    } else {
                        console.log('Not object')
                        return `<td>${value}</td>`
                    }
                    
                }
                
                data += '<tr>';
                data += valueToRow(streamData)
                data += '</tr>'


            }
            if (!headersSet) {
                // If there were no headers set, there was no data
                return;
            }
            data += `</table>`;
            console.log('data: ' + data)
            client.replyHtmlText(roomId, event, data);
            
        });
    } catch (err) {
        logError(err);
    }
    
}