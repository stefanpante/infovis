import mysql.connector
import json


def saveToFile(name, data):
	with open(name, 'wb') as fp:
		json.dump(data, fp)

constructorTeams = {}

def getDriverStandings():
	data = None
	with open('positions.json') as file:
		data = json.load(file)

	return data

def getDriverStanding(results, driverRef, positions):
	career = {}
	for tup in results:
		points = tup[0]
		
		year = tup[2]
		position = tup[1]
		position2 = 25
		
		if(str(year) in positions["seasons"]):
			if(str(driverRef) in positions["seasons"][str(year)]):
				position2 = positions["seasons"][str(year)][str(driverRef)]


		constructor = tup[3]
		rank = tup[4]
		if not(year in career):
			career[year] = {
				"year": year,
				"points": 0,
				"wins": 0,
				"snd": 0,
				"thd": 0,
				"position": position2,
				"constructorId": constructor
			}
		if not(constructor in constructorTeams):
			constructorTeams[constructor] = {
				"teams": {}
			}

		if not( year in constructorTeams[constructor]["teams"]):
			constructorTeams[constructor]["teams"][year] = []
			constructorTeams[constructor]["teams"][year].append(driverRef)
		else:
			if not(driverRef in constructorTeams[constructor]["teams"][year]):
				constructorTeams[constructor]["teams"][year].append(driverRef)


		if position == 1:
			career[year]["wins"] += 1
		if position == 2:
			career[year]["snd"] += 1
		if position == 3:
			career[year]["thd"] += 1

		career[year]["points"] += calculatePoints(position)

	career2 = []
	for year in career:
		career2.append(career[year])
    
	return career2

# def getPosition(year, driverRef):


positionPoints = {
    1: 25,
    2: 18,
    3: 15,
    4: 12,
    5: 10,
    6: 8,
    7: 6,
    8: 4,
    9: 2,
    10: 1
}
def calculatePoints(position):
    if(position in positionPoints):
        return positionPoints[position]
    return 0
    

def openConnection():
	connection = mysql.connector.connect(user='root', password='', host='127.0.0.1', database='f1')
	cursor = connection.cursor() 
	return cursor, connection

# first fetch all drivers
def getDrivers(cursor):
	cursor.execute("SELECT driverId, driverRef, forename, surname FROM `drivers`")
	result = cursor.fetchall()
	return result

def getConstructors(cursor):
	cursor.execute("SELECT constructorId, constructorRef FROM `constructors`")
	result = cursor.fetchall()
	return result

def getDriverResults(drivers, cursor, positions):
	driver_results = {}
	for driver in drivers:
		cursor.execute("""SELECT results.points, results.position, races.year, constructors.constructorRef, results.rank 
						  FROM drivers inner join results on results.driverId = drivers.driverId 
						  inner join races on races.raceId = results.raceId 
						  inner join constructors on results.constructorId = constructors.constructorId 
						  where drivers.driverRef = \'""" + str(driver[1]) + "\'")
		results = cursor.fetchall()
		fullname = driver[2] + " " +  driver[3]
		career = getDriverStanding(results, driver[1], positions)
		driver_result = {
			"name" : fullname,
			"driverId": driver[1],
			"career": career
		}
		k = str(driver[1])
		driver_results[k] = driver_result
	return driver_results;



positions = getDriverStandings()
print positions["seasons"]["2003"]["webber"]
print "Connect to database"
cursor, connection = openConnection()
print "Get all drivers"
drivers = getDrivers(cursor)
print "get driver results"
driver_results = getDriverResults(drivers, cursor, positions)
print "Save drivers to file"
saveToFile('drivers.json', driver_results)
print "Drivers saved to file"

print "save team composition to file"
saveToFile("teamcomp.json", constructorTeams)
print " team composition saved to file"


