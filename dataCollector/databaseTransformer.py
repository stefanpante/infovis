import mysql.connector
import json


def saveToFile(data):
	with open('drivers.json', 'wb') as fp:
		json.dump(data, fp)


def getDriverStanding(results):
	career = {}
	for tup in results:
		points = tup[0]
		position = tup[1]
		year = tup[2]
		constructor = tup[3]
		rank = tup[4]
		if not(year in career):
			career[year] = {
				"points": 0,
				"wins": 0,
				"snd": 0,
				"thd": 0,
				"position": 25,
				"constructorId": constructor
			}
		if position == 1:
			career[year]["wins"] += 1
		if position == 2:
			career[year]["snd"] += 1
		if position == 3:
			career[year]["thd"] += 1
		# if career[year]["position"] > rank and not(rank is None):
		# 	career[year]["position"] = rank

		career[year]["points"] += points

	return career


print "Connect to database"
connection = mysql.connector.connect(user='root', password='', host='127.0.0.1', database='f1')

# first fetch all drivers
cursor = connection.cursor()
cursor.execute("SELECT driverId, driverRef, forename, surname FROM `drivers`")
result = cursor.fetchall()
drivers = result


driver_results = {}
for driver in drivers:
	cursor.execute("""SELECT results.points, results.position, races.year, constructors.constructorRef, results.rank 
					  FROM drivers inner join results on results.driverId = drivers.driverId 
					  inner join races on races.raceId = results.raceId 
					  inner join constructors on results.constructorId = constructors.constructorId 
					  where drivers.driverRef = \'""" + str(driver[1]) + "\'")
	results = cursor.fetchall()
	fullname = driver[2] + " " +  driver[3]
	career = getDriverStanding(results)
	driver_result = {
		"name" : fullname,
		"driverId": driver[1],
		"career": career
	}
	k = str(driver[1])
	driver_results[k] = driver_result

print "Save to file"
saveToFile(driver_results)
print "saved to file"

# cursor.execute("""SELECT results.points, results.position, races.year, results.constructorId, results.rank 
# 	FROM drivers inner join results on results.driverId = drivers.driverId 
# 	inner join races on races.raceId = results.raceId where drivers.driverRef = \'michael_schumacher\'""")
# results = cursor.fetchall()

# getDriverStanding(results)

