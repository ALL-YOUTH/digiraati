import json
import sys

with open('backup.json', 'r') as input_file:
    dixu_database = json.load(input_file)

if (len(sys.argv[1]) < 1):
    print("Ilmoita raadin tunnus ensimmäisenä argumenttina")
    exit(1)

else:
    for council in dixu_database["councils"]:
        if (council["id"] == str(sys.argv[1])):
            found_council = council

council_users = found_council["users"]

results = []

for user in dixu_database["users"]:
    for council_user in council_users:
        if(council_user == str(user["username"])):
            print(user)
            temp_user = {}
            temp_user["username"] = user["username"]
            temp_user["real_name"] = user["fname"] + " " + user["lname"]
            temp_user["id"] = user["id"]
            messages_written = 0
            for message in found_council["messages"]:
                if (message["sender"] == temp_user["username"]):
                    messages_written += 1

            temp_user["messages_written"] = messages_written
            results.append(temp_user)
            print("Appended")
print(results)