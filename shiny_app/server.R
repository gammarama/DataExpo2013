library(shiny)
library(plyr)
library(rjson)
library(ggplot2)

enumerateMetrics <- function(...) {
    return(paste(unlist(lapply(c(...), function(met){return(paste(met, " = mean(", met, ", na.rm = TRUE", ")", sep = ""))})), collapse = ", "))
}

getUrbanity <- function(data, city) {
    return(subset(data, QSB == city)$URBAN_GR)
}

generatePlot <- function(data, city, metric) {
    require(ggplot2)
    
    city_avg <- subset(clean.all.city, QSB == city)[,metric]
    urban_avg <- mean(subset(clean.all.city, URBAN_GR == getUrbanity(data, city))[,metric])
    overall_avg <- mean(clean.all.city[,metric])
    
    x <- factor(c(city, as.character(getUrbanity(data, city)), "All Cities"), levels = c(city, as.character(getUrbanity(data, city)), "All Cities"))
    y <- c(city_avg, urban_avg, overall_avg)
    
    qplot(x, y, geom = "bar", stat = "identity", alpha = c(I(1), I(0.8), I(0.2)), fill = c(I("gold"), I("darkred"), I("black"))) +
        xlab("Community/Region") +
        ylab(metric)
}

generatePlot2 <- function(data, city, metric) {
    require(ggplot2)
    
    sorted.data <- data[order(data[,metric]), ]
    QSB.strs <- as.character(sorted.data$QSB)
    sorted.data$sameUrbanicity <- (sorted.data$URBAN_GR == getUrbanity(data, city))
    sorted.data$sortedQSB <- factor(sorted.data$QSB, levels = QSB.strs)
    sorted.data$urbanFac <- "Other"
    sorted.data$urbanFac[sorted.data$sameUrbanicity] <- "Same"
    sorted.data$urbanFac[sorted.data$QSB == city] <- "City"
    sorted.data$urbanFac <- factor(sorted.data$urbanFac, levels = c("Other", "Same", "City"))
    sorted.data$isCity <- sorted.data$QSB == city
    
    ggplot(data = sorted.data, aes_string(x = "sortedQSB", y = metric)) +
        geom_point(data = sorted.data, aes(size = sameUrbanicity, alpha = urbanFac, colour = isCity)) +
        scale_colour_manual(values = c(I("darkred"), I("gold"))) +
        scale_size_discrete(range = c(3, 5)) +
        scale_alpha_discrete(range = c(0.2, 1)) +
        coord_flip() +
        xlab("Community") +
        ylab(metric)    
}

generatePlot3 <- function(data, city, metric) {
    sorted.data <- data[order(-data[,metric]), ]
    QSB.strs <- as.character(sorted.data$QSB)
    sorted.data$sortedQSB <- factor(sorted.data$QSB, levels = QSB.strs)
    
    sorted.data$isCity <- sorted.data$QSB == city
    sorted.data$sameUrbanicity <- (sorted.data$URBAN_GR == getUrbanity(data, city))
    
    ggplot(data = subset(sorted.data, sameUrbanicity), aes_string(x = "sortedQSB", y = metric)) +
        geom_bar(data = subset(sorted.data, sameUrbanicity), stat = "identity", aes(fill = isCity)) +
        scale_fill_manual(values = c(I("darkred"), I("gold"))) +
        theme(axis.text.x = element_text(angle=90))
}

generatePlot4 <- function(full.data, city, metric) {
    sorted.data <- full.data
    QSB.strs <- as.character(sorted.data$QSB)
    sorted.data$sortedQSB <- factor(sorted.data$QSB, levels = QSB.strs)
    
    sorted.data$isCity <- sorted.data$QSB == city
    sorted.data$sameUrbanicity <- (sorted.data$URBAN_GR == getUrbanity(data, city))
    
    ggplot(data = subset(sorted.data, sameUrbanicity), aes_string(x = "sortedQSB", y = metric)) +
        geom_boxplot(data = subset(sorted.data, sameUrbanicity), aes(fill = isCity)) +
        scale_fill_manual(values = c(I("darkred"), I("gold"))) +
        coord_flip()
}

generatePlot5 <- function(data, full.data, city, metric) {
    metricMax <- sapply(metrics, getMax, data = full.data)    
    
    scaledInd <- sapply(metrics, function(x){data[,x] / metricMax[names(metricMax) == x]})
    new.data <- data.frame(data$QSB, scaledInd)
    
    data.interest <- subset(new.data, data.QSB == city)
    data.interest <- data.interest[-1]
    data.interest <- sort(data.interest, decreasing = TRUE)

    
    x <- factor(names(data.interest), levels = names(data.interest))
    y <- as.numeric(data.interest)
    z <- x == metric
        
    qplot(x = x, y = y, geom = "bar", stat = "identity", fill = x) +
        theme(legend.position = "off")
}

generateTable <- function(data, city, metric) {
    city_avg <- subset(clean.all.city, QSB == city)[,metric]
    urban_avg <- mean(subset(clean.all.city, URBAN_GR == getUrbanity(data, city))[,metric])
    overall_avg <- mean(clean.all.city[,metric])
    
    x <- factor(c(city, as.character(getUrbanity(data, city)), "All Cities"), levels = c(city, as.character(getUrbanity(data, city)), "All Cities"))
    y <- c(city_avg, urban_avg, overall_avg)
    
    df <- data.frame(x,y)
    names(df) <- c("Community/Region", metric)
    
    return(df)
}

addResourcePath('data', '~/ShinyApps/DataExpo2013/data')
addResourcePath('css', '~/ShinyApps/DataExpo2013/css')

clean.all <- read.csv("data/sotc.csv")

metrics <- c("PASSION", "LEADERSH", "AESTHETI", "ECONOMY", "SOCIAL_O", "COMMUNIT", "INVOLVEM", "OPENNESS", "SOCIAL_C")

getMax <- function(data, met) {return(max(data[,met], na.rm = TRUE))}

shinyServer(function(input, output) {
    data <- function() {
        expr.all <- paste(as.expression(paste("ddply(clean.all, .(QSB, URBAN_GR), summarise, ")), enumerateMetrics(metrics), ", TOTALRESP = length(GENDER))", sep = "")
        expr.2008 <- paste(as.expression(paste("ddply(subset(clean.all, source == \"sotc08\"), .(QSB, URBAN_GR), summarise, ")), enumerateMetrics(metrics), ", TOTALRESP = length(GENDER))", sep = "")
        expr.2009 <- paste(as.expression(paste("ddply(subset(clean.all, source == \"sotc09\"), .(QSB, URBAN_GR), summarise, ")), enumerateMetrics(metrics), ", TOTALRESP = length(GENDER))", sep = "")
        expr.2010 <- paste(as.expression(paste("ddply(subset(clean.all, source == \"sotc10\"), .(QSB, URBAN_GR), summarise, ")), enumerateMetrics(metrics), ", TOTALRESP = length(GENDER))", sep = "")
        
        #2008 doesn't have thriving or struggli, new metric needed?
        clean.all.city <- eval(parse(text = expr.all))
        clean.2008.city <- eval(parse(text = expr.2008))
        clean.2009.city <- eval(parse(text = expr.2009))
        clean.2010.city <- eval(parse(text = expr.2010))
        
        lats <- c(37.688889, 30.440608, 44.953703, 40.793395, 37.338978, 39.952335, 26.705621, 33.689060, 33.080143, 25.788969, 32.840695, 33.768321, 38.040584, 47.925257, 41.593370, 41.079273, 46.786672, 42.331427, 32.460976, 34.000710, 35.227087, 27.498928, 40.014986, 30.396032, 41.081445, 45.464698)   
        lons <- c(-97.336111, -84.286079, -93.089958, -77.860001, -121.894955, -75.163789, -80.036430, -78.886694, -83.232099, -80.226439, -83.632402, -118.195617, -84.503716, -97.032855, -87.346427, -85.139351, -92.100485, -83.045754, -84.987709, -81.034814, -80.843127, -82.574819, -105.270546, -88.885308, -81.519005, -98.486483)
        
        clean.all.city$lats <- rev(lats)
        clean.all.city$lons <- rev(lons)
        
        return(list(data_json = toJSON(unname(split(clean.all.city, 1:nrow(clean.all.city))))))
    }
    
    output$d3io <- reactive({ data() })
})
