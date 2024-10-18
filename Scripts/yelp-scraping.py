import requests
import boto3
from datetime import datetime
from decimal import Decimal

class RestaurantData:
    def __init__(self):
        self.restataurant_ids = set();
        
    def fetch_yelp_data(self, api_key, cuisine, location='manhattan', limit=50):
        headers = {'Authorization': f"Bearer {api_key}"}
        params = {
            'location': location,
            'categories': cuisine,
            'limit': limit
        }
        
        api_url = 'https://api.yelp.com/v3/businesses/search'
        response = requests.get(api_url, headers=headers, params=params).json()
        if "businesses" in response:
            return response['businesses']
        return []
    
    def format_data(self, entry, cuisine):
        formatted = {
            'BusinessID': entry['id'],
            'Cuisine': cuisine,
            'insertedAtTime': str(datetime.now()),
            'name': entry.get('name', 'N/A'),
            'rating': Decimal(str(entry.get('rating', 0.0))),
            'review_count': entry.get('review_count', 0),
            'latitude': Decimal(str(entry['coordinates'].get('latitude', 0.0))),
            'longitude': Decimal(str(entry['coordinates'].get('longitude', 0.0))),
            'address': ", ".join(entry['location']['display_address']),
            'zip_code': entry['location'].get('zip_code', 'N/A'),
        }
        
        return formatted
    
    def store_data(self, restaurant_data):
        dynamodb = boto3.resource('dynamodb', 
                                  aws_access_key_id='AKIAZI2LHLFXQE4MB2QP',
                                  aws_secret_access_key='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',
                                  region_name='us-east-1')
        table = dynamodb.Table('yelp-restaurants')
        for data in restaurant_data:
            table.put_item(Item=data)
        print(f"Stored {len(restaurant_data)} items in DynamoDB")
        
    def fetch_and_store(self, api_key, cuisines):
        all_data = []
        for cuisine in cuisines:
            yelp_data = self.fetch_yelp_data(api_key, cuisine)
            for entry in yelp_data:
                if entry['id'] not in self.restataurant_ids:
                    self.restataurant_ids.add(entry['id'])
                    formatted = self.format_data(entry, cuisine)
                    all_data.append(formatted)
        self.store_data(all_data)


if __name__ == '__main__':
    api_key = 'RRaFJy2D8bJgnJaOp5gwmyUaKAy4PLQssDQZnzsxjuIPu-6ho78vKj54HDqd0TeGjfKbwOIJPjSw8UhEg_fkhymNynGlxMLE7wM7_HdlR6PgB4rFPtCON7Pe-yEEZ3Yx'
    # cuisines = ['mexican', 'chinese', 'italian']
    cuisines = ['Japanese', 'Thai', 'Indian', 'French', 'Korean', 'American']
    restaurant_data = RestaurantData()
    restaurant_data.fetch_and_store(api_key, cuisines)