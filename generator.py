#################################################
# TTL Static Data Generator for LwM2M ontology  #
# Author: Flor Sanders                          #
# Project: VOP 2020 - IoT & Solid               #
# Date: 2020/04/07                              #
# Description:                                  #
#   Generates static data for all supported 	#
#   objects and resources for 1 device.         #
#################################################

# Importing libraries for obtaining random values and representing date and time
import random
import datetime

# General parameters
filename = 'static.ttl'

# Device parameters
deviceID = "api/clients/thijs-Galago-Pro"

# Temperature parameters
temperatureObjects = 1  # Amount of temperature objects to be generated
valuesPerTemperatureObject = 1 # Amount of sensor values per temperature object
averageTemperature = 17 # Average temperature measured
stdDevTemperature = 1.5 # Standard deviation on the measured temperature

# Humidity parameters
humidityObjects = 0  # Amount of temperature objects to be generated
valuesPerHumidityObject = 0 # Amount of sensor values per temperature object
averageHumidity = 60 # Average temperature measured
stdDevHumidity = 5 # Standard deviation on the measured temperature

# Time parameters
timestampDelta = datetime.timedelta(hours=1)    # Time interval between individual measurements for a sensor
randomDelta = datetime.timedelta(seconds=1) # Random delay so the measurements of different sensors don't coincide exactly
initialTimestamp = datetime.datetime.now() - max(valuesPerHumidityObject, valuesPerTemperatureObject)*timestampDelta  # Time at which measurements start

# Function to add a missing zero in date/time elements after casting int to string
def format(s):
    return "0"*(len(s) == 1) + s

# Write a resource and all of its components and dependencies in one go
def writeResource(file, objectID, resourceID, resourceType, i, j, value, type, timestamp = None):
    file.write("# " + resourceType + " " + str(i) + str(j) + "\n")
    file.write("<" + deviceID + "/" + str(objectID) + "/" + str(i) + "/" + str(resourceID) + "/" + str(j) + "> rdf:type lwm2m:" + resourceType + ";\n")
    file.write("\tlwm2m:organizedInto <" + deviceID + "/" + str(objectID) + "/" + str(i) + ">;\n")
    if(timestamp != None):
        file.write("\tlwm2m:hasTimeStamp \"" + str(timestamp.year) + "-" + format(str(timestamp.month)) + "-" + format(str(timestamp.day)) + "T" + format(str(timestamp.hour)) + ":" + format(str(timestamp.minute)) + ":" + format(str(timestamp.second)) + "\"^^xsd:dateTime;\n")
    file.write("\tlwm2m:hasValue \"" + value + "\"^^" + type + ";\n")
    file.write("\trdf:type lwm2m:ResourceInstance;\n")
    file.write("\tlwm2m:hasResourceInstanceID \""+ str(i) + str(j) +"\"^^xsd:integer.\n")

def writeTemperatureOrHumidityObjects(file, deviceID, objectID, objectType, unit, minRange, maxRange, objectAmount, datapoints, timestamps, valuesPerObject):
    file.write("### " + str(objectID) + " Objects\n")
    for i in range(objectAmount):
        # Creating the object
        file.write("## " + str(objectID) + " object " + str(i) + "\n")
        file.write("<" + deviceID + "/" + str(objectID) + "/" + str(i) + "> rdf:type lwm2m:" + objectType + ";\n")
        # Defining the object is contained by above device
        file.write("\tlwm2m:containedBy <" + deviceID + ">;\n")
        # Adding predicates relating object to resources
        file.write("\tlwm2m:consistsOf <" + deviceID + "/" + str(objectID) + "/" + str(i) + "/5701/0>;\n")
        file.write("\tlwm2m:consistsOf <" + deviceID + "/" + str(objectID) + "/" + str(i) + "/5601/0>;\n")
        file.write("\tlwm2m:consistsOf <" + deviceID + "/" + str(objectID) + "/" + str(i) + "/5602/0>;\n")
        file.write("\tlwm2m:consistsOf <" + deviceID + "/" + str(objectID) + "/" + str(i) + "/5603/0>;\n")
        file.write("\tlwm2m:consistsOf <" + deviceID + "/" + str(objectID) + "/" + str(i) + "/5604/0>;\n")
        for j in range(valuesPerObject):
            file.write("\tlwm2m:consistsOf <" + deviceID + "/" + str(objectID) + "/" + str(i) + "/5700/0>;\n")
        file.write("\trdf:type lwm2m:ObjectInstance;\n\tlwm2m:hasObjectInstanceID \"" + str(i) + "\"^^xsd:integer.\n")

        # Creating the resources and its instances
        file.write("## Resources and instances\n")
        # SensorUnits
        writeResource(file, objectID, 5701, "SensorUnits", i, 0, unit, "xsd:string")
        writeResource(file, objectID, 5601, "MinMeasuredValue", i, 0, str(min(datapoints))[0:4], "xsd:float")
        writeResource(file, objectID, 5602, "MaxMeasuredValue", i, 0, str(max(datapoints))[0:4], "xsd:float")
        writeResource(file, objectID, 5603, "MinRangeValue", i, 0, minRange, "xsd:float")
        writeResource(file, objectID, 5604, "MaxRangeValue", i, 0, maxRange, "xsd:float")
        # SensorValue
        for j in range(valuesPerObject):
            writeResource(file, objectID, 5700, "SensorValue", i, j, str(datapoints[j])[0:4], "xsd:float", timestamps[j])

# Opening the file in write mode.
with open(filename, 'w') as file:
    # Adding the necessary prefixes
    file.write("@prefix lwm2m: <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#>.\n")
    file.write("@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.\n")
    file.write("@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.\n")
    file.write("@base <http://localhost:8080/>.\n\n")
    # Creating the Device "Thing" that everything should be connected to
    file.write("<" + deviceID + "> rdf:type lwm2m:Device;\n")
    for i in range(temperatureObjects):
        file.write("\t lwm2m:contains <" + deviceID + "/3303/" + str(i) + ">;\n")
    for i in range(humidityObjects):
        file.write("\t lwm2m:contains <" + deviceID + "/3304/" + str(i) + ">;\n")
    file.write("\t lwm2m:hasDeviceID \"" + deviceID + "\"^^xsd:string.\n")


    # Creating the values to be used for temperature data
    temperatureTimestamps = [initialTimestamp + k*timestampDelta + random.randint(0, 60)*randomDelta for k in range(valuesPerTemperatureObject)]
    temperatureData = [random.gauss(averageTemperature, stdDevTemperature) for k in range(valuesPerTemperatureObject)]
    # Adding the temperature objects
    writeTemperatureOrHumidityObjects(file, deviceID,3303, "LWM2MTemperatureObject", "deg C", "-20.0", "100.0", temperatureObjects, temperatureData, temperatureTimestamps, valuesPerTemperatureObject)
    
    # Creating the values to be used for humidity data
    humidityTimestamps = [initialTimestamp + k*timestampDelta + random.randint(0, 60)*randomDelta for k in range(valuesPerHumidityObject)]
    humidityData = [random.gauss(averageHumidity, stdDevHumidity) for k in range(valuesPerHumidityObject)]
    # Adding the temperature objects
    writeTemperatureOrHumidityObjects(file, deviceID,3304, "LWM2MHumidityObject", "%", "0", "100", humidityObjects, humidityData, humidityTimestamps, valuesPerHumidityObject)

    # Adding the device object
    file.write("### Device object\n")
    # Creating the object
    file.write("<" + deviceID + "/3/0> rdf:type lwm2m:LWM2MDevice;\n")
    # Defining the object is contained by above device
    file.write("\tlwm2m:containedBy <" + deviceID + ">;\n")
    # Adding predicates relating object to resources
    IDs = [0,1,2,3,7,8,9,10]
    names = ["Manufacturer", "ModelNumber", "SerialNumber", "FirmWareVersion", "PowerSourceVoltage", "PowerSourceCurrent", "BatteryLevel", "MemoryFree"]
    values = ["CompanyXYZ", "XXX-XXXXX-XXXX", "QWERTYXYZABC", "1.0.0a", "3000", "20", "55", "1024"]
    types = ["xsd:string"] * 4 + ["xsd:float"] * 3 + ["xsd:integer"]
    for i in IDs:
        file.write("\tlwm2m:consistsOf <" + deviceID + "/3/0/" + str(i) + "/0>;\n")
    file.write("\trdf:type lwm2m:ObjectInstance;\n")
    file.write("\tlwm2m:hasObjectInstanceID \"0\"^^xsd:integer.\n")
    for i in range(len(IDs)):
        writeResource(file, 3, IDs[i], names[i], 0, 0, values[i], types[i])

    # Adding the server object
    file.write("### Server object\n")
    # Creating the object
    file.write("<" + deviceID + "/1/0> rdf:type lwm2m:LWM2MDevice;\n")
    # Defining the object is contained by above device
    file.write("\tlwm2m:containedBy <" + deviceID + ">;\n")
    # Adding predicates relating object to resources
    IDs = [0,1,2,3]
    names = ["ShortServerID", "Lifetime", "DefaultMinimumPeriod", "DefaultMaximumPeriod"]
    values = ["888888888", "9000", "20", "60"]
    types = ["xsd:integer"] * 4
    for i in IDs:
        file.write("\tlwm2m:consistsOf <" + deviceID + "/1/0/" + str(i) + "/0>;\n")
    file.write("\trdf:type lwm2m:ObjectInstance;\n")
    file.write("\tlwm2m:hasObjectInstanceID \"0\"^^xsd:integer.\n")
    for i in range(len(IDs)):
        writeResource(file, 1, IDs[i], names[i], 0, 0, values[i], types[i])
