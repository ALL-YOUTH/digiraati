import json

highest_user_id = 0

with open ('backup.json', 'r') as backup:
    data = json.load(backup)

for user in data["users"]:
    try:
        print("User id: " + str(user["testing_number"]))
        if (int(user["testing_number"]) > highest_user_id):         
            highest_user_id = int(user["testing_number"])
    except Exception as e:
        print("Malformed user ID: " + str(e))

print("Highest user ID: " + str(highest_user_id))