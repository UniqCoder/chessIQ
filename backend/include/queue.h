#ifndef CUSTOM_QUEUE_H
#define CUSTOM_QUEUE_H

#include <stdexcept>

template <typename T>
class CustomQueue {
private:
    T* data;
    int capacity;
    int front_index;
    int rear_index;
    int count;

    void resize() {
        int new_capacity = capacity == 0 ? 4 : capacity * 2;
        T* new_data = new T[new_capacity];
        for (int i = 0; i < count; ++i) {
            new_data[i] = data[(front_index + i) % capacity];
        }
        delete[] data;
        data = new_data;
        front_index = 0;
        rear_index = count;
        capacity = new_capacity;
    }

public:
    CustomQueue() : capacity(0), front_index(0), rear_index(0), count(0), data(nullptr) {}

    ~CustomQueue() {
        delete[] data;
    }

    void push(const T& element) {
        if (count == capacity) {
            resize();
        }
        data[rear_index] = element;
        rear_index = (rear_index + 1) % capacity;
        count++;
    }

    void pop() {
        if (empty()) {
            throw std::out_of_range("Queue<>::pop(): empty queue");
        }
        front_index = (front_index + 1) % capacity;
        count--;
    }

    T& front() {
        if (empty()) {
            throw std::out_of_range("Queue<>::front(): empty queue");
        }
        return data[front_index];
    }

    const T& front() const {
        if (empty()) {
            throw std::out_of_range("Queue<>::front(): empty queue");
        }
        return data[front_index];
    }

    bool empty() const {
        return count == 0;
    }

    int size() const {
        return count;
    }
};

#endif // CUSTOM_QUEUE_H
