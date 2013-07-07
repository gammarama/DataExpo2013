library(shiny)
library(plyr)
library(rjson)

addResourcePath('data', '~/ShinyApps/DataExpo2013/data')
addResourcePath('css', '~/ShinyApps/DataExpo2013/css')

clean.all <- read.csv("data/sotc.csv")

shinyServer(function(input, output) {
    data <- function() {
        clean.all$THRIVEIND <- clean.all$THRIVING - clean.all$STRUGGLI
        
        #2008 doesn't have thriving or struggli, new metric needed?
        clean.all.city <- ddply(clean.all, .(QSB), summarise, THRIVEIND = mean(THRIVEIND, na.rm = TRUE), TOTALRESP = length(GENDER))
        clean.2008.city <- ddply(subset(clean.all, source == "sotc08"), .(QSB), summarise, THRIVEIND = mean(THRIVEIND, na.rm = TRUE), TOTALRESP = length(GENDER))
        clean.2009.city <- ddply(subset(clean.all, source == "sotc09"), .(QSB), summarise, THRIVEIND = mean(THRIVEIND, na.rm = TRUE), TOTALRESP = length(GENDER))
        clean.2010.city <- ddply(subset(clean.all, source == "sotc10"), .(QSB), summarise, THRIVEIND = mean(THRIVEIND, na.rm = TRUE), TOTALRESP = length(GENDER))
        
        lats <- c(37.688889, 30.440608, 44.953703, 40.793395, 37.338978, 39.952335, 26.705621, 33.689060, 33.080143, 25.788969, 32.840695, 33.768321, 38.040584, 47.925257, 41.593370, 41.079273, 46.786672, 42.331427, 32.460976, 34.000710, 35.227087, 27.498928, 40.014986, 30.396032, 41.081445, 45.464698)   
        lons <- c(-97.336111, -84.286079, -93.089958, -77.860001, -121.894955, -75.163789, -80.036430, -78.886694, -83.232099, -80.226439, -83.632402, -118.195617, -84.503716, -97.032855, -87.346427, -85.139351, -92.100485, -83.045754, -84.987709, -81.034814, -80.843127, -82.574819, -105.270546, -88.885308, -81.519005, -98.486483)
        
        clean.all.city$lats <- rev(lats)
        clean.all.city$lons <- rev(lons) 
        return(list(data_json = toJSON(unname(split(clean.all.city, 1:nrow(clean.all.city))))))
    }
    
    output$d3io <- reactive({ data() })
})
