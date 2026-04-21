#ifndef CUSTOM_HASH_H
#define CUSTOM_HASH_H

#include <stdexcept>

template <typename K, typename V>
class CustomHashMap {
private:
    struct HashNode {
        K key;
        V value;
        HashNode* next;
        HashNode(const K& k, const V& v) : key(k), value(v), next(nullptr) {}
    };

    HashNode** buckets;
    int capacity;
    int size_;

    unsigned int hash_function(const K& key) const {
        // Very basic djb2-like string hash, or pass-through for integers.
        // C++ requires specialization for a real robust hash map, 
        // but for this MVP we assume K is something like a string.
        unsigned int hash = 5381;
        // Simple hack to treat key as byte array (not safe for all types, but works for basic types/strings if specialized)
        const char* str = reinterpret_cast<const char*>(&key);
        for (unsigned int i = 0; i < sizeof(K); ++i) {
            hash = ((hash << 5) + hash) + str[i];
        }
        return hash % capacity;
    }

public:
    CustomHashMap(int cap = 101) : capacity(cap), size_(0) {
        buckets = new HashNode*[capacity];
        for (int i = 0; i < capacity; ++i) {
            buckets[i] = nullptr;
        }
    }

    ~CustomHashMap() {
        for (int i = 0; i < capacity; ++i) {
            HashNode* curr = buckets[i];
            while (curr != nullptr) {
                HashNode* prev = curr;
                curr = curr->next;
                delete prev;
            }
        }
        delete[] buckets;
    }

    void put(const K& key, const V& value) {
        unsigned int index = hash_function(key);
        HashNode* curr = buckets[index];
        while (curr != nullptr) {
            if (curr->key == key) {
                curr->value = value;
                return;
            }
            curr = curr->next;
        }
        HashNode* new_node = new HashNode(key, value);
        new_node->next = buckets[index];
        buckets[index] = new_node;
        size_++;
    }

    bool get(const K& key, V& out_value) const {
        unsigned int index = hash_function(key);
        HashNode* curr = buckets[index];
        while (curr != nullptr) {
            if (curr->key == key) {
                out_value = curr->value;
                return true;
            }
            curr = curr->next;
        }
        return false;
    }

    bool contains(const K& key) const {
        V temp;
        return get(key, temp);
    }

    void remove(const K& key) {
        unsigned int index = hash_function(key);
        HashNode* curr = buckets[index];
        HashNode* prev = nullptr;

        while (curr != nullptr) {
            if (curr->key == key) {
                if (prev == nullptr) {
                    buckets[index] = curr->next;
                } else {
                    prev->next = curr->next;
                }
                delete curr;
                size_--;
                return;
            }
            prev = curr;
            curr = curr->next;
        }
    }

    int size() const {
        return size_;
    }
};

// String specialization for hash function
#include <string>

template <>
inline unsigned int CustomHashMap<std::string, std::string>::hash_function(const std::string& key) const {
    unsigned int hash = 5381;
    for (char c : key) {
        hash = ((hash << 5) + hash) + c;
    }
    return hash % capacity;
}

#endif // CUSTOM_HASH_H
