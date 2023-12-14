# CTRL+SHIFT+R To Run in Pycharm

import boto3

client = boto3.client('dynamodb')

# class RDStoDynamo:
#     def __init__(self, dyn_resource):
#         self.table = None
#
#     def scan_sleepQuality(self, year_range):
#         sleep_quality: [] = []
#         scan_kwargs = {
#             'FilterExpression': Key('deviceId')
#
#         }
#         try
#             done = False
#             start_key = None
#             while not done:
#                 if start_key:
#                     scan_kwargs['ExclusiveStartKey'] = start_key
#                 response = self.table.scan(**scan_kwargs)
#                 sleep_quality.extend(response.get('Items', []))


# 2023-02-15T14:27:38.000Z

# date = datetime.fromisoformat('2023-02-15T14:27:38')
# print(date)
# start_of_day = datetime(date.year, date.month, date.day)
# delta_since_start_of_day = date - start_of_day
# delta_till_end_of_day = timedelta(days=1) - delta_since_start_of_day
# end_of_day = start_of_day + timedelta(days=1)
# print(start_of_day)
# print(end_of_day)

subject_id = "6a215864-3d5c-4a6c-90e8-99f1deaf4f68"
# table = boto3.resource('dynamodb').Table('PROJECT_healthtracker_temperature')
# response = table.query(
#     IndexName="subject_id_createdAt_index",
#     KeyConditionExpression=Key("subject_id").eq(subject_id) &
#                            Key('createdAt').between(start_of_day.isoformat(sep='T', timespec='auto'),
#                                                     end_of_day.isoformat(sep='T', timespec='auto'))
# )

# table = boto3.resource('dynamodb').Table('PROJECT_subject_device_link')
# response_deviceId = table.query(
#     KeyConditionExpression=Key("subject_id").eq(subject_id)
# )
#
# if 'Items' in response_deviceId:
#     if len(response_deviceId['Items']) == 1:
#         print(response_deviceId['Items'][0]['deviceId'])

# for i in response_deviceId['Items']:
#     print(i)
