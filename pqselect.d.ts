// Type definitions for paramquery Select
// By: Paramvir Dhindsa
// Project: http://paramquery.com/
/// <reference types="jquery" /> 
/// <reference types="jqueryui" />

//import jQuery = require('jquery');

interface JQuery{
    pqSelect(options: pq.selectT.options| string): any
    pqSelect(method: string, param: any): any
    jQuery: JQueryStatic;
}

interface JQueryStatic{

}

declare module pq {

    namespace selectT{
        type numberorstring = number|string;
        
        /*******************************options **************************************************/

        interface options{
            
            checkbox?: boolean
            deselect?: boolean
            displayText?: String
            edgeDetect?: boolean
            hoverCls?: string            
            maxDisplay?: number
            maxSelect?: number
            multiplePlaceholder?: string
            optionsResizable?: object //2.0
            position?: object
            radio?: boolean
            rowHt?: number //2.0
            selectCls?: string
            search?: boolean
            searchRule?: string
            selectallText?: string
            singlePlaceholder?: string
            width?: numberorstring                

            //#################################inline Events-------------            
            
            change?: (evt, ui) => any
            create?: (evt, ui) => any
            maxSelectReach?: (evt, ui) => any
            maxSelectExceed?: (evt, ui) => any        
        
        }

        /******************************************select methods ***************/
        interface instance{            

            close()

            destroy()

            disable()

            enable()

            getInstance(): {
                select: instance
            }

            isOpen(): boolean

            open()

            option(): any

            option(name: String): any

            option(name: string, value: any);

            option(obj: any)

            refresh()

            refreshData()
            
            widget(): JQueryStatic
        }
    }

    /** create pqselect plugin.  */
    function select(selector: string| JQuery, options: selectT.options): selectT.instance;
}  

export default pq;