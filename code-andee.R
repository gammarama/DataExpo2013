library(ggplot2)
library(plyr)
library(maps)
library(scales)
library(xtable)


data <- read.csv("sotc.csv")
data.dictionary <- read.csv("sotc_dictionary.csv")

qplot(QD7, data = data) + coord_flip()


head(data$source)


ddply(data[,c("QSB", "PROJWT")], .(QSB, PROJWT), nrow )


#Education related questions
#Q7F, Q7G, Q7G (children), Q7O (museums), Q8A (college grads), QD7
#race_gro
#urban_gr

#Q7M caring in the community


qplot(Q7F, data = data)

qplot(QD8, data = data, fill = QD7, geom = "bar", position = "dodge") +
    coord_flip() +
    xlab("") +
    ylab("") +
    scale_x_discrete(labels = c("Other", "Own", "Rent", "NA")) +
    guides(fill = guide_legend(nrow = 2)) +
    theme(legend.position = "bottom")