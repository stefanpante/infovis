import mysql.connector

print "Connect to database"
connection = mysql.connector.connect(user='root', password='', host='127.0.0.1', database='f1')

def getDriverStanding(results):
	career = {}
	for tup in results:
		points = tup[0]
		position = tup[1]
		year = tup[2]
		if not(year in career):
			career[year] = {
				"points": 0,
				"wins": 0,
				"snd": 0,
				"thd": 0
			}
		if position == 1:
			career[year]["wins"] += 1
		if position == 2:
			career[year]["snd"] += 1
		if position == 3:
			career[year]["thd"] += 1

		career[year]["points"] += points

	print career


# first fetch all drivers
cursor = connection.cursor()
cursor.execute("SELECT driverId, driverRef FROM `drivers`")
result = cursor.fetchall()
drivers = result

# for driver in drivers:
# 	cursor.execute("""SELECT results.points, results.position, races.year 
# 		FROM drivers inner join results on results.driverId = drivers.driverId 
# 		inner join races on races.raceId = results.raceId where drivers.driverRef = \'""" + str(driver[1]) + "\'")
# 	results = cursor.fetchall()
# 	if driver is "hamilton":
# 		driverStanding = getDriverStanding(results)

cursor.execute("""SELECT results.points, results.position, races.year 
	FROM drivers inner join results on results.driverId = drivers.driverId 
	inner join races on races.raceId = results.raceId where drivers.driverRef = \'hamilton\'""")
results = cursor.fetchall()

getDriverStanding(results)

